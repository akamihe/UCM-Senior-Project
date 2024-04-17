package ucmo.senior_project.domain.gametypes;

import com.fasterxml.jackson.databind.JsonNode;
import ucmo.senior_project.domain.Game;
import ucmo.senior_project.domain.GameUser;
import ucmo.senior_project.resource.auth.UserData;
import ucmo.senior_project.resource.game.GameData;
import ucmo.senior_project.resource.game.types.BattleshipTaticalData;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.function.Consumer;

public class Battleship implements Game {

    public static final int PHASE_START = 0;

    public static final int PHASE_ROUND_ACTIVE = 1;

    public static final int PHASE_BETWEEN_ROUND = 2;

    public static final int TIME_BETWEEN_ROUNDS = 5*1000;
    public static final int TIME_DURING_ROUNDS = 20 * 1000;
    public static final int END_ROUND_AFTER_SHOTS = 1000 * 2;

    public static int MAX_ROUNDS = 30;

    private List<GameUser> alivePlayers = new ArrayList<>();
    private HashMap<GameUser, BattleshipPlayerData> playerGameData;
    private int targetShift = 0;
    private int phase = 0;
    private int round = 0;

    private boolean finished = false;

    private long time;

    public Battleship() {
        this.playerGameData = new HashMap<>();
    }
    public GameUser findTarget(GameUser self) {
        int index = this.alivePlayers.indexOf(self);
        if(index == - 1) {
            return null;
        }
        return this.alivePlayers.get((index + targetShift) % this.alivePlayers.size());
    }
    public void fireBolt(GameUser source, int x, int y) {
        BattleshipPlayerData self = playerGameData.get(source);
        GameUser target = findTarget(source);
        if(target != null && self.getHitStatus() == BattleshipPlayerData.HIT_STATUS_NEW) {
            BattleshipPlayerData data = playerGameData.get(target);
            int status = data.fireAt(x,y);
            if(status == BattleshipPlayerData.HIT_STATUS_HIT || status == BattleshipPlayerData.HIT_STATUS_SUNK) {
                self.awardPoints(5);
            }
            self.setHitStatus(status);
        }
    }
    private void beginNewRound() {
        playerGameData.values().forEach(e->e.setHitStatus(BattleshipPlayerData.INVALID_STATE));
        this.alivePlayers.forEach(e-> playerGameData.get(e).setHitStatus(BattleshipPlayerData.HIT_STATUS_NEW));
        phase = PHASE_ROUND_ACTIVE;
        time = System.currentTimeMillis() + TIME_DURING_ROUNDS;
        this.targetShift++;
        if(this.alivePlayers.size() == 0) {
            this.targetShift = 0;
            return;
        }
        if((targetShift % this.alivePlayers.size()) == 0) { //back to top of round
            targetShift = 1;
        }
    }
    private boolean endOfRound() {
        this.alivePlayers.removeIf(p -> this.playerGameData.get(p).areAllShipsSunk());
        if(alivePlayers.size() == 1) {
            return true;
        }
        phase = PHASE_BETWEEN_ROUND;
        time = System.currentTimeMillis() + TIME_BETWEEN_ROUNDS;
        round++;
        return round == MAX_ROUNDS;
    }
    private boolean handleGameRoundStatus() {
        long timeRemaining = time - System.currentTimeMillis();
        if (timeRemaining < 0) {
            switch (phase) {
                case PHASE_ROUND_ACTIVE:
                    return this.endOfRound();
                case PHASE_BETWEEN_ROUND:
                    //expedite time
                    this.beginNewRound();
                    break;
            }
        }
        if(phase == PHASE_ROUND_ACTIVE && timeRemaining > END_ROUND_AFTER_SHOTS && this.playerGameData.values().stream().allMatch(e->e.getHitStatus() != 0 || e.areAllShipsSunk())) {
            time = System.currentTimeMillis() + END_ROUND_AFTER_SHOTS;
        }
        return false;
    }
    @Override
    public BattleshipTaticalData getGameData(GameUser user) {
        long timeRemaining = time - System.currentTimeMillis();
        BattleshipPlayerData playerData = playerGameData.get(user);
        if (phase == PHASE_ROUND_ACTIVE) {
            GameUser targetUser = this.findTarget(user);
            if (targetUser == null) { //is dead
                return new BattleshipTaticalData(false, timeRemaining, true, true, new UserData(user), playerData.getBoard(), playerData.getShips(), 0);
            }
            BattleshipPlayerData targetData = playerGameData.get(targetUser);
            return new BattleshipTaticalData(false, timeRemaining, false, false, new UserData(targetUser), targetData.getBoard(), Collections.emptyList(),playerData.getHitStatus());
        }
        if(phase == PHASE_BETWEEN_ROUND || phase == PHASE_START) {
            BattleshipPlayerData data = playerGameData.get(user);
            return new BattleshipTaticalData(true, timeRemaining, true, data.areAllShipsSunk(), new UserData(user), data.getBoard(), data.getShips(), 0);
        }
        return null;
    }

    @Override
    public void updateInput(GameUser user, JsonNode data) {

    }

    @Override
    public boolean updateSystem() {
        return !handleGameRoundStatus();
    }

    @Override
    public void init(List<GameUser> players) {
        for(GameUser user:players) {
            this.alivePlayers.add(user);
            this.playerGameData.put(user, new BattleshipPlayerData());
        }
        this.beginNewRound();
    }

    @Override
    public void finish(List<GameUser> players) {
        players.forEach(
            gameUser -> {
                BattleshipPlayerData data = playerGameData.get(gameUser);
                gameUser.updateScore((!data.areAllShipsSunk() ? 25d : 0) + data.getAwardedPoints());
            }
        );
    }
}