package ucmo.senior_project.domain.gametypes;

import com.fasterxml.jackson.databind.JsonNode;
import ucmo.senior_project.domain.Game;
import ucmo.senior_project.domain.GameUser;
import ucmo.senior_project.resource.game.GameData;
import ucmo.senior_project.resource.game.types.DebugGameData;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DebugGame implements Game {
    private HashMap<GameUser, String> userStrings = new HashMap<>();
    @Override
    public DebugGameData getGameData(GameUser user) {
        HashMap<String, String> asData = new HashMap<>();
        for (Map.Entry<GameUser, String> entry : userStrings.entrySet()) {
            asData.put(
                entry.getKey().getUsername(),
                entry.getValue()
            );
        }
        return new DebugGameData(
            asData
        );
    }

    @Override
    public void updateInput(GameUser user, JsonNode data) {
        JsonNode node = data.findValue("test");
        if(node != null) {
            this.userStrings.put(user, node.asText());
        }
    }
    @Override
    public void updateSystem() {

    }

    @Override
    public void init(List<GameUser> users) {
        users.forEach((gameUser -> {this.userStrings.put(gameUser, "");}));
    }
}
