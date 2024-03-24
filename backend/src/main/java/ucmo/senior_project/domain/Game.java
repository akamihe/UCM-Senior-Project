package ucmo.senior_project.domain;

import com.fasterxml.jackson.databind.JsonNode;
import ucmo.senior_project.resource.game.GameData;

import java.util.List;
public interface Game {
    GameData getGameData(GameUser user);
    void updateInput(GameUser user, JsonNode data);
    boolean updateSystem();
    void init(List<GameUser> users);

    void finish(List<GameUser> users);
}
