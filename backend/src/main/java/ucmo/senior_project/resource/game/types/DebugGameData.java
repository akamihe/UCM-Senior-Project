package ucmo.senior_project.resource.game.types;

import lombok.AllArgsConstructor;
import lombok.Data;
import ucmo.senior_project.resource.game.GameData;

import java.util.HashMap;
import java.util.Map;

@Data
@AllArgsConstructor
public class DebugGameData implements GameData {
    private Map<String, String> data;
}
