package ucmo.senior_project.resource.game;

import lombok.Data;
import ucmo.senior_project.domain.Game;
import ucmo.senior_project.domain.GameBroker;
import ucmo.senior_project.domain.GameUser;
import ucmo.senior_project.resource.auth.UserData;
import ucmo.senior_project.resource.auth.UserDataInterface;
import ucmo.senior_project.resource.input.ActiveGames;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Data
public class GameBrokerData implements UserDataInterface {
    private String gameType;
    private String code;
    private List<UserData> users = new ArrayList<>();

    private UserData self;
    private UserData gameMaster;
    private int secondsUntilNextGame = 0;
    private String nextGameName = "";

    private boolean betweenGames = false;

    private boolean gameFinished = false;
    private ActiveGames chooseableGames;

    public GameBrokerData(GameBroker game, GameUser user) {
        this.chooseableGames = new ActiveGames(Arrays.stream(GameBroker.loadableGames).map(e->e.getSimpleName()).toList());
        this.code = game.getCode();
        Game currentGame = game.getCurrentGame();
        if(currentGame != null) {
            this.gameType = currentGame.getClass().getSimpleName();
        } else {
            this.betweenGames = game.isBetweenGames();
            if(this.betweenGames) {
                this.secondsUntilNextGame = (int) ((game.getNextGameStartTime() - System.currentTimeMillis()) / 1000);
                this.nextGameName = game.getNextGames().getFirst().getClass().getSimpleName();
            }
            this.gameFinished = game.isFinished();
        }
        this.users.addAll(game.getUsers().stream().map((GameUser data) -> new UserData(data, game.getGameMaster() == data)).toList());
        this.self = new UserData(user, game.getGameMaster() == user);
        this.gameMaster = new UserData(game.getGameMaster(), true);
    }
}
