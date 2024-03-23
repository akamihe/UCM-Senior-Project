package ucmo.senior_project.resource.gametypes;

import lombok.AllArgsConstructor;
import lombok.Data;
import ucmo.senior_project.resource.GameData;

import java.util.HashMap;

@Data
@AllArgsConstructor
public class DebugGameData implements GameData {
    private HashMap<String, String> data;
}
