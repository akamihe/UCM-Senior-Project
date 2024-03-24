package ucmo.senior_project.domain.gametypes;

import com.fasterxml.jackson.databind.JsonNode;
import ucmo.senior_project.domain.Game;
import ucmo.senior_project.domain.GameUser;
import ucmo.senior_project.resource.game.GameData;
import ucmo.senior_project.resource.game.types.HangManData;

import java.util.List;

public class HangMan implements Game {
    @Override
    public GameData getGameData(GameUser user) {
        return new HangManData();
    }

    @Override
    public void updateInput(GameUser user, JsonNode data) {

    }

    @Override
    public void updateSystem() {

    }

    @Override
    public void init(List<GameUser> users) {

    }
}
