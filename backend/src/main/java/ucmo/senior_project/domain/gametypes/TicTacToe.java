package ucmo.senior_project.domain.gametypes;

import com.fasterxml.jackson.databind.JsonNode;
import ucmo.senior_project.domain.Game;
import ucmo.senior_project.domain.GameUser;
import ucmo.senior_project.resource.game.GameData;
import ucmo.senior_project.resource.game.types.TicTacToeData;

import java.util.List;

public class TicTacToe  implements Game {
    @Override
    public GameData getGameData(GameUser user) {
        return new TicTacToeData();
    }

    @Override
    public void updateInput(GameUser user, JsonNode data) {

    }

    @Override
    public boolean updateSystem() {
        return false;
    }

    @Override
    public void init(List<GameUser> users) {

    }
    @Override
    public void finish(List<GameUser> users) {

    }
}
