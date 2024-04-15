package ucmo.senior_project.resource.game.types;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ucmo.senior_project.domain.GameUser;
import ucmo.senior_project.domain.gametypes.PictionaryStroke;
import ucmo.senior_project.resource.auth.UserData;
import ucmo.senior_project.resource.game.GameData;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PictionaryData implements GameData {

    private UserData artist;
    private String word;
    private PictionaryStroke[] canvasData;

    private UserData roundWinner;
    private boolean isDrawing = false;
    private boolean isCorrect = false;

    private boolean isIncorrect = false;
    boolean isRoundDone = false;
    private long timer = -1;
}
