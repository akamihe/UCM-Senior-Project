package ucmo.senior_project.resource.gametypes;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ucmo.senior_project.resource.GameData;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SudokuData implements GameData {
    //todo, add game data that will convert to JSON data,
    int a;
}
