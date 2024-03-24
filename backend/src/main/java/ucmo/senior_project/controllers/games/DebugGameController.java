package ucmo.senior_project.controllers.games;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ucmo.senior_project.controllers.AbstractGameBrokerController;
import ucmo.senior_project.domain.gametypes.DebugGame;
import ucmo.senior_project.resource.auth.UserDisconnected;
import ucmo.senior_project.resource.game.GameData;
import ucmo.senior_project.resource.game.types.DebugGameData;

import java.util.Collections;
import java.util.Map;

@RestController
@CrossOrigin
@RequestMapping
@RequiredArgsConstructor
public class DebugGameController extends AbstractGameBrokerController {

    @MessageMapping("/game/debug/input/{code}")
    @SendTo("/game/debug/listen/{code}")
    public DebugGameData handleUserInput(@DestinationVariable String code, JsonNode data) {
        if(this.activateUser(code)) {
            DebugGame debugGame = this.getCurrentGame(DebugGame.class);
            if(debugGame != null) {
                debugGame.updateInput(this.user, data);
                return debugGame.getGameData(this.user);
            }
        }
        Map<String, String> map = Collections.emptyMap();
        return new DebugGameData(map);
    }
    @MessageMapping("/game/debug/listen/{code}")
    @SendTo("/game/debug/listen/{code}")
    public DebugGameData handleWakeCall(@DestinationVariable String code, JsonNode data) {
        if(this.activateUser(code)) {
            DebugGame debugGame = this.getCurrentGame(DebugGame.class);
            if(debugGame != null) {
                return debugGame.getGameData(this.user);
            }
        }
        Map<String, String> map = Collections.emptyMap();
        return new DebugGameData(map);
    }
}
