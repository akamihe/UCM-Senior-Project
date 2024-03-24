package ucmo.senior_project.resource.game.types;


import lombok.Data;
import ucmo.senior_project.domain.gametypes.Sudoku;
import ucmo.senior_project.resource.game.GameData;

@Data
public class SudokuData implements GameData {
    //todo, add game data that will convert to JSON data,
    private String time;

    private boolean startup = false;
    public SudokuData(long datetime) {
        if (datetime > Sudoku.TIME_TOTAL) {
            datetime -= Sudoku.TIME_TOTAL;
            this.startup = true;
        }
        long seconds = datetime/1000;
        long minutes = seconds/60;
        seconds -= (minutes * 60);
        this.time = minutes + ":" + seconds;
    }
}
