package ucmo.senior_project.resource.game.types;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ucmo.senior_project.resource.game.GameData;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BattleshipData implements GameData {
    //todo, add game data that will convert to JSON data,
    int a;
}
