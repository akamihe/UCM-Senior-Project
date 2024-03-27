package ucmo.senior_project.domain.gametypes;

import com.fasterxml.jackson.databind.JsonNode;
import ucmo.senior_project.domain.Game;
import ucmo.senior_project.domain.GameBroker;
import ucmo.senior_project.domain.GameUser;
import ucmo.senior_project.resource.game.GameData;
import ucmo.senior_project.resource.game.types.SudokuData;

import java.util.HashMap;
import java.util.List;
import java.util.function.Consumer;

public class Sudoku implements Game {

    public static long TIME_FRAME_GAME = 1000*60*2; // 2 minutes to solve
    private HashMap<GameUser, SudokuData> boards = new HashMap<>();

    private long startTime;
    private long timeElasped; // /1000 to convert to seconds
    @Override
    public SudokuData getGameData(GameUser user) {
        return this.boards.get(user);
    }

    @Override
    public void updateInput(GameUser user, JsonNode data) {

    }
    private boolean allFinished() {
        return boards.values().stream().filter((data) -> !data.checkSolved(timeElasped)).count() == 0;
    }

    @Override
    public boolean updateSystem() {
        timeElasped = System.currentTimeMillis() - this.startTime;
        if(allFinished()) {
            return false;
        }
        return timeElasped < TIME_FRAME_GAME;
    }

    @Override
    public void init(List<GameUser> users) {
        SudokuData data = new SudokuData();
        users.stream().forEach((user) -> boards.put(user, data.createCopy()));
        this.startTime = System.currentTimeMillis();
    }
    @Override
    public void finish(List<GameUser> users) {
        users.stream()
                .sorted((user1, user2) ->
                {
                    long score1 = boards.get(user1).getSolvedAt();
                    long score2 = boards.get(user2).getSolvedAt();
                    return Long.compare(score2, score1);
                })
                .forEachOrdered(
                    new Consumer<GameUser>() {
                        long previousTime = Long.MAX_VALUE;
                        double scoreMark = 0;
                        @Override
                        public void accept(GameUser gameUser) {
                            long solvedAt = boards.get(gameUser).getSolvedAt();
                            if(solvedAt != previousTime) {
                                scoreMark += GameBroker.ENDGAME_POINT_REWARD_PER_PLAYER;
                                previousTime = solvedAt;
                            }
                            double userScore = scoreMark;
                            gameUser.updateScore(userScore);
                        }
                    }
            );
    }
}
