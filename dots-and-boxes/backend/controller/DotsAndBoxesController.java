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
import ucmo.senior_project.domain.gametypes.DotsAndBoxes;
import ucmo.senior_project.resource.game.types.DotsAndBoxesData;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Collections;
import java.util.Map;

@RestController
@CrossOrigin
@RequestMapping
@RequiredArgsConstructor
public class DotsAndBoxesController extends AbstractGameBrokerController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/game/dotsandboxes/listen/{code}")
    @SendTo("/game/dotsandboxes/listen/{code}")
    public DotsAndBoxesData handleWakeCall(@DestinationVariable String code, JsonNode data) {
        if(this.activateUser(code)) {
            DotsAndBoxes game = this.getCurrentGame(DotsAndBoxes.class);
            if(game != null && game.getGameData(this.user).isDataComplete()) {
                return game.getGameData(this.user);
            } else {
                System.err.println("Incomplete game data for user: " + this.user);
            }
        }
        return null;
    }

    @MessageMapping("/game/dotsandboxes/setValue/{code}")
    @SendTo("/game/dotsandboxes/listen/{code}")
    public Map<String, Object> handleLineDraw(@DestinationVariable String code, JsonNode message) {
        if (this.activateUser(code)) {
            DotsAndBoxes game = getCurrentGame(DotsAndBoxes.class);
            if (game != null) {
                int i = message.get("i").asInt();
                int j = message.get("j").asInt();
                int k = message.get("k").asInt();
                DotsAndBoxesData gameData = game.getGameData(this.user);
                if (gameData.drawLine(i, j, k, this.user)) {
                    Map<String, Object> gameState = gameData.getGameStateForTransmission();
                    messagingTemplate.convertAndSend("/game/listen/" + code, gameState);
                    return gameState;
                }
            }
        }
        return Collections.emptyMap();
    }
}
