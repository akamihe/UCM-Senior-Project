package ucmo.senior_project.domain.gametypes;

import com.fasterxml.jackson.databind.JsonNode;
import ucmo.senior_project.domain.Game;
import ucmo.senior_project.domain.TempUser;
import ucmo.senior_project.resource.GameData;
import ucmo.senior_project.resource.gametypes.DebugGameData;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

public class DebugGame implements Game {
    private HashMap<TempUser, String> userStrings = new HashMap<>();
    @Override
    public GameData getGameData(TempUser user) {
        HashMap<String, String> asData = new HashMap<>();
        for (Map.Entry<TempUser, String> entry : userStrings.entrySet()) {
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
    public void updateInput(TempUser user, JsonNode data) {
        JsonNode node = data.findValue("test");
        if(node != null) {
            this.userStrings.put(user, node.asText());
        }
    }
    @Override
    public void updateSystem() {

    }
}
