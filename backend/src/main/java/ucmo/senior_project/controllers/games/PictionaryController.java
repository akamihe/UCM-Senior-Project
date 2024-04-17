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
import ucmo.senior_project.domain.gametypes.Pictionary;
import ucmo.senior_project.domain.gametypes.PictionaryStroke;
import ucmo.senior_project.domain.gametypes.Sudoku;
import ucmo.senior_project.resource.game.types.PictionaryData;
import ucmo.senior_project.resource.game.types.SudokuData;

@RestController
@CrossOrigin
@RequestMapping
@RequiredArgsConstructor
public class PictionaryController extends AbstractGameBrokerController {
    @MessageMapping("/game/pictionary/listen/{code}")
    @SendTo("/game/pictionary/listen/{code}")
    public PictionaryData handleWakeCall(@DestinationVariable String code, JsonNode data) {
        if(this.activateUser(code)) {
            Pictionary game = this.getCurrentGame(Pictionary.class);
            if(game != null) {
                return game.getGameData(this.user);
            }
        }
        return null;
    }
    @MessageMapping("/game/pictionary/guess/{code}")
    @SendTo("/game/pictionary/listen/{code}")
    public PictionaryData guess(@DestinationVariable String code, JsonNode data) {
        if(this.activateUser(code)) {
            Pictionary game = this.getCurrentGame(Pictionary.class);
            if(game != null) {
                game.guessWord(this.user, data.get("text").asText());
                return game.getGameData(this.user);
            }
        }
        return null;
    }
    @MessageMapping("/game/pictionary/UpdateCanvasData/{code}")
    @SendTo("/game/pictionary/listen/{code}")
    public PictionaryData updateCanvasData(@DestinationVariable String code, PictionaryStroke[] canvasData) {
        if(this.activateUser(code)) {
            Pictionary game = this.getCurrentGame(Pictionary.class);
            if(game != null) {
                game.setPictionaryStroke(this.user, canvasData);
                return game.getGameData(this.user);
            }
        }
        return null;
    }
}
