package ucmo.senior_project.domain.gametypes;

import com.fasterxml.jackson.databind.JsonNode;
import ucmo.senior_project.domain.Game;
import ucmo.senior_project.domain.TempUser;
import ucmo.senior_project.resource.GameData;
import ucmo.senior_project.resource.gametypes.SudokuData;

import java.util.List;

public class Sudoku implements Game {
    public static long TIME_TOTAL = 60*5; // 5 minutes
    public static long TIME_START = 10; //10 seconds
    private long endTime = 0;
    private long lastUpdate = 0;
    @Override
    public GameData getGameData(TempUser user) {
        return new SudokuData(this.endTime);
    }

    @Override
    public void updateInput(TempUser user, JsonNode data) {

    }

    @Override
    public void updateSystem() {
        if(this.endTime == 0) {
            this.lastUpdate = System.currentTimeMillis();
            this.endTime = (TIME_TOTAL + TIME_START) * 1000 + this.lastUpdate;
        } else {
            long timeNow = System.currentTimeMillis();
            endTime -= (timeNow - this.lastUpdate);
            this.lastUpdate = timeNow;
        }
    }

    @Override
    public void init(List<TempUser> users) {

    }
}