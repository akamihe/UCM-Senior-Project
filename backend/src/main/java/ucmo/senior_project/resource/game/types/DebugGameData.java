package ucmo.senior_project.resource.game.types;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Map;

@Data
@AllArgsConstructor
public class DebugGameData {
    private Map<String, String> data;
}
