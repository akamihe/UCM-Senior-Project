package ucmo.senior_project.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.RequestBody;
import ucmo.senior_project.domain.Game;
import ucmo.senior_project.domain.GameBroker;
import ucmo.senior_project.domain.GameUser;
import ucmo.senior_project.resource.auth.GameCodeLogin;
import ucmo.senior_project.resource.auth.UserDataInterface;
import ucmo.senior_project.resource.auth.UserDisconnected;
import ucmo.senior_project.resource.game.GameBrokerData;

public class AbstractGameBrokerController {
    protected GameUser user;
    protected GameBroker gameBroker;
    protected Game currentGame;


    public boolean activateUser(@DestinationVariable String code) {
        this.user = GameUser.fetchGameUser(code);
        if (user == null) {
            return false;
        }
        this.gameBroker = user.getInstance();
        this.currentGame = this.gameBroker.getCurrentGame();
        return true;
    }

    public <GameType extends Game> GameType getCurrentGame(Class<GameType> type) {
        return type.isInstance(this.currentGame) ? (GameType) this.currentGame: null;
    }
}
