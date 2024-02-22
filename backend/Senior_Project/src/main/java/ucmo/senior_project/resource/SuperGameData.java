package ucmo.senior_project.resource;

import lombok.Data;
import ucmo.senior_project.domain.Game;
import ucmo.senior_project.domain.SuperGame;
import ucmo.senior_project.domain.TempUser;

import java.util.ArrayList;
import java.util.List;

@Data
public class SuperGameData {
    private GameData currentGame;
    private String gameType;
    private String code;
    private List<UserData> users = new ArrayList<>();

    public SuperGameData(SuperGame game, TempUser user) {
        this.code = game.getCode();
        Game currentGame = game.getCurrentGame();
        if(currentGame != null) {
            this.currentGame = currentGame.getGameData(user);
            this.gameType = currentGame.getClass().getSimpleName();
        }
        this.users.addAll(game.getUsers().stream().map((TempUser data) -> new UserData(data.getUsername())).toList());
    }
}
