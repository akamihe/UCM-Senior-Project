package ucmo.senior_project.domain.data;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class GameBrokerData {
    private String code;
    private List<GameUserData> users = new ArrayList<>();
    private List<String> games = new ArrayList<>();
    private int gameNum;
}
