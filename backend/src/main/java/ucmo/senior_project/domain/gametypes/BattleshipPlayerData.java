package ucmo.senior_project.domain.gametypes;


import lombok.Data;
import ucmo.senior_project.resource.game.types.BattleshipBoardData;
import ucmo.senior_project.resource.game.types.BattleshipShip;

import java.util.*;

@Data
public class BattleshipPlayerData {
    public static final int HIT_STATUS_NEW = 0;
    public static final int HIT_STATUS_HIT = 1;
    public static final int HIT_STATUS_SUNK = 2;
    public static final int HIT_STATUS_MISS = 3;
    public static final int INVALID_STATE = 4;

    private BattleshipBoardData board;
    private List<BattleshipShip> ships;

    private int awardedPoints = 0;
    private int hitStatus = HIT_STATUS_NEW;
    // Implementing Fisher–Yates shuffle
    private static int[] shuffleArray(int[] ar)
    {
        Random rnd = new Random();
        for (int i = ar.length - 1; i > 0; i--)
        {
            int index = rnd.nextInt(i + 1);
            // Simple swap
            int a = ar[index];
            ar[index] = ar[i];
            ar[i] = a;
        }
        return ar;
    }
    public BattleshipPlayerData() {
        board = new BattleshipBoardData();
        int[] list = shuffleArray(new int[] {2, 3, 3, 4});
        ships = new ArrayList<>();
        Random rnd = new Random();
        for(int i = 0; i < list.length; i++) {
            int x = Math.abs(rnd.nextInt()) % 5;
            int y = Math.abs(rnd.nextInt()) % (5-list[i]);
            BattleshipShip newShip = new BattleshipShip(x,y, list[i], BattleshipShip.DIRECTION_DOWN);
            for(BattleshipShip ship: ships) {
                ship.rotate();
            }
            ships.add(newShip);
        }
        BattleshipShip ship = ships.get(1);
        ship.setXCordStart(ship.getXCordStart() + 5);
        ship = ships.get(2);
        ship.setYCordStart(ship.getYCordStart() + 5);
        ship = ships.get(3);
        ship.setXCordStart(ship.getXCordStart() + 5);
        ship.setYCordStart(ship.getYCordStart() + 5);
    }

    public int fireAt(int x, int y) {
        Optional<BattleshipShip> hitShip = ships.stream().filter((s)-> s.hasHitShip(x,y)).findAny();
        if(hitShip.isPresent()) {
            board.setValueAt(x, y, BattleshipBoardData.HIT);
            return hitShip.get().isShipSunk() ? BattleshipPlayerData.HIT_STATUS_SUNK : HIT_STATUS_HIT;
        } else {
            board.setValueAt(x,y, BattleshipBoardData.MISS);
            return HIT_STATUS_MISS;
        }
    }
    public boolean areAllShipsSunk() {
        return this.ships.stream().allMatch(BattleshipShip::isShipSunk);
    }

    public void awardPoints(int points) {
        this.awardedPoints += points;
    }
}