package ucmo.senior_project.domain.gametypes;

import com.fasterxml.jackson.databind.JsonNode;
import ucmo.senior_project.domain.Game;
import ucmo.senior_project.domain.TempUser;
import ucmo.senior_project.resource.GameData;
import ucmo.senior_project.resource.gametypes.HangManData;

public class HangMan implements Game {
    @Override
    public GameData getGameData(TempUser user) {
        return new HangManData();
    }

    @Override
    public void updateInput(TempUser user, JsonNode data) {

    }

    @Override
    public void updateSystem() {

    }
}
