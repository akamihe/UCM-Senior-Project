package ucmo.senior_project.domain.gametypes;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import ucmo.senior_project.domain.GameUser;
import ucmo.senior_project.resource.game.types.BattleshipBoardData;
import ucmo.senior_project.resource.game.types.BattleshipShip;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.function.Consumer;
import java.util.function.IntPredicate;
import java.util.function.Predicate;

import static org.junit.jupiter.api.Assertions.*;

class BattleshipPlayerDataTest {

    @Test
    void battleshipRandomizerDoesntOverlapAndKeepsInBounds() {
        for(int j = 0; j < 1000; j++) {
            BattleshipPlayerData data = new BattleshipPlayerData();
            int[][] overlapMapCheck = new int[10][10];
             data.getShips().forEach(ship -> {
                for(int i = 0; i < ship.getLength(); i++) {
                    switch (ship.getDirection()) {
                        case BattleshipShip.DIRECTION_DOWN:
                            overlapMapCheck[ship.getXCordStart()][ship.getYCordStart() + i]++;
                            break;
                        case BattleshipShip.DIRECTION_UP:
                            overlapMapCheck[ship.getXCordStart()][ship.getYCordStart() - i]++;
                            break;
                        case BattleshipShip.DIRECTION_RIGHT:
                            overlapMapCheck[ship.getXCordStart() + i][ship.getYCordStart()]++;
                            break;
                        case BattleshipShip.DIRECTION_LEFT:
                            overlapMapCheck[ship.getXCordStart() - i][ship.getYCordStart()]++;
                            break;
                    }
                }
             });
            assertTrue(Arrays.stream(overlapMapCheck).allMatch(
                ints -> Arrays.stream(ints).allMatch(value -> value < 2)
            ));
        }
    }
    @Test
    void fireAtReturnsCodeForMiss() {
        BattleshipPlayerData data = new BattleshipPlayerData();
        assertEquals(BattleshipBoardData.NO_STRIKES, data.getBoard().getBoard()[0][0]);
        data.setShips(Collections.emptyList());
        assertEquals(BattleshipPlayerData.HIT_STATUS_MISS, data.fireAt(0,0));
        assertEquals(BattleshipBoardData.MISS, data.getBoard().getBoard()[0][0]);
    }
    @Test
    void fireAtReturnsCodeForHit() {
        BattleshipPlayerData data = new BattleshipPlayerData();
        BattleshipShip ship = new BattleshipShip(0,0, 5, BattleshipShip.DIRECTION_RIGHT);
        data.setShips(List.of(ship));
        int i = 0;
        for(; i < 4; i++) {
            assertEquals(BattleshipPlayerData.HIT_STATUS_HIT, data.fireAt(i, 0));
        }
        assertEquals(BattleshipPlayerData.HIT_STATUS_SUNK, data.fireAt(i, 0));
    }
    @Test
    void awardsPoints() {
        BattleshipPlayerData data = new BattleshipPlayerData();
        data.awardPoints(50);
        assertEquals(50, data.getAwardedPoints());
    }
    @Test
    void allShipSunkTest() {
        BattleshipPlayerData data = new BattleshipPlayerData();
        assertFalse(data.areAllShipsSunk());
        data.getShips().forEach(battleshipShip -> {
            boolean[] data1 = new boolean[]{true, true, true, true, true};
            battleshipShip.setHits(data1);
        });
        assertTrue(data.areAllShipsSunk());
    }
}