package ucmo.senior_project.domain.data;

import lombok.Data;

@Data
public class GameUserData {
    private int id;
    private String username;
    private double score;
    private double previousScore;
    private boolean isGameMaster;
    private boolean isDone;
}
