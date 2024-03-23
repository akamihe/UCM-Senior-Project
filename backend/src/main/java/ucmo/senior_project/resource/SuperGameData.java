package ucmo.senior_project.resource;

import lombok.Data;
import ucmo.senior_project.domain.Game;
import ucmo.senior_project.domain.SuperGame;
import ucmo.senior_project.domain.TempUser;

import java.util.ArrayList;
import java.util.List;

@Data
public class SuperGameData implements UserDataInterface {
    private GameData currentGame;
    private String gameType;
    private String code;
    private List<UserData> users = new ArrayList<>();

    private UserData self;
    private UserData gameMaster;

    public SuperGameData(SuperGame game, TempUser user) {
        this.code = game.getCode();
        Game currentGame = game.getCurrentGame();
        if(currentGame != null) {
            this.currentGame = currentGame.getGameData(user);
            this.gameType = currentGame.getClass().getSimpleName();
        }
        this.users.addAll(game.getUsers().stream().map((TempUser data) -> new UserData(data, game.getGameMaster() == data)).toList());
        this.self = new UserData(user, game.getGameMaster() == user);
        this.gameMaster = new UserData(game.getGameMaster(), true);
    }
}
