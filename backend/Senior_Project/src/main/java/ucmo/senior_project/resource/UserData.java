package ucmo.senior_project.resource;

import lombok.AllArgsConstructor;
import lombok.Data;
import ucmo.senior_project.domain.TempUser;


@Data
@AllArgsConstructor
public class UserData {
    private int id;
    private String username;

    private double score;

    private boolean isGameMaster = false;

    public UserData(TempUser user) {
        this(user, user.getInstance().getGameMaster() == user);
    }
    public UserData(TempUser user, boolean isGameMaster) {
        this.score = user.getCurrentScore();
        this.id = user.getInstanceId();
        this.username = user.getUsername();
        this.isGameMaster = isGameMaster;
    }
}
