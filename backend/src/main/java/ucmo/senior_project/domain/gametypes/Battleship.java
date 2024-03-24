package ucmo.senior_project.domain.gametypes;

import com.fasterxml.jackson.databind.JsonNode;
import ucmo.senior_project.domain.Game;
import ucmo.senior_project.domain.GameUser;
import ucmo.senior_project.resource.game.GameData;
import ucmo.senior_project.resource.game.types.BattleshipData;

import java.util.HashMap;
import java.util.List;

public class Battleship implements Game {
    private HashMap<GameUser, BattleshipBoard> board = new HashMap<>();
    @Override
    public GameData getGameData(GameUser user) {
        return new BattleshipData();
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
