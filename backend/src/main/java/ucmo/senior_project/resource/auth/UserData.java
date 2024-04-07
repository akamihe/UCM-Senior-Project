package ucmo.senior_project.resource.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import ucmo.senior_project.domain.GameUser;

import java.awt.*;


@Data
@AllArgsConstructor
public class UserData {
    private int id;
    private String username;

    private double score;
    private String color;
    private double previousScore;
    private boolean isGameMaster = false;

    public UserData(GameUser user) {
        this(user, user.getInstance().getGameMaster() == user);
    }
    public UserData(GameUser user, boolean isGameMaster) {
        this.score = user.getCurrentScore();
        this.id = user.getInstanceId();
        this.username = user.getUsername();
        this.isGameMaster = isGameMaster;
        this.previousScore = user.getPreviousScore();
        this.color = "#" + user.getColor();
    }
}
