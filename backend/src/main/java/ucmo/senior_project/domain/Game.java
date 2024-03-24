package ucmo.senior_project.domain;

import com.fasterxml.jackson.databind.JsonNode;
import ucmo.senior_project.resource.GameData;
import ucmo.senior_project.resource.gametypes.DebugGameData;
import java.util.List;
public interface Game {
    GameData getGameData(TempUser user);
    void updateInput(TempUser user, JsonNode data);
    void updateSystem();
    void init(List<TempUser> users);
}