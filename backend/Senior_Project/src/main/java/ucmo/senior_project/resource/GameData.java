package ucmo.senior_project.resource;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import ucmo.senior_project.domain.Game;
import ucmo.senior_project.domain.SuperGame;
import ucmo.senior_project.domain.TempUser;

import java.util.ArrayList;
import java.util.List;

@Data
public class GameData {
    private Game currentGame;
    private String code;
    private List<UserData> users = new ArrayList<>();

    public GameData(SuperGame game) {
        this.code = game.getCode();
        this.currentGame = game.getCurrentGame();
        this.users.addAll(game.getUsers().stream().map((TempUser data) -> new UserData(data.getUsername())).toList());
    }
}
