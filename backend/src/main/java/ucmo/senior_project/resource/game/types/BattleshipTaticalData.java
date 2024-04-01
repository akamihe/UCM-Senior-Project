package ucmo.senior_project.resource.game.types;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ucmo.senior_project.resource.auth.UserData;
import ucmo.senior_project.resource.game.GameData;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BattleshipTaticalData implements GameData {
    private boolean betweenRound = false;
    private long timeRemaining = 10;
    boolean self = false;
    boolean defeated = false;
    private UserData userData;
    private BattleshipBoardData board;
    private List<BattleshipShip> shipList;

    private int hitStatus;
}
