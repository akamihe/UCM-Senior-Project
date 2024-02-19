package ucmo.senior_project.domain;

import com.fasterxml.jackson.databind.JsonNode;
import ucmo.senior_project.resource.GameData;
import ucmo.senior_project.resource.gametypes.DebugGameData;

public interface Game {
    GameData getGameData();
    void updateInput(TempUser user, JsonNode data);
    void updateSystem();
}
