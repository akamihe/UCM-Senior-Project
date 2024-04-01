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
import ucmo.senior_project.domain.gametypes.Battleship;
import ucmo.senior_project.domain.gametypes.Sudoku;
import ucmo.senior_project.resource.game.types.BattleshipTaticalData;
import ucmo.senior_project.resource.game.types.SudokuData;

@RestController
@CrossOrigin
@RequestMapping
@RequiredArgsConstructor
public class BattleshipController extends AbstractGameBrokerController {


    @MessageMapping("/game/battleship/listen/{code}")
    @SendTo("/game/battleship/listen/{code}")
    public BattleshipTaticalData handleWakeCall(@DestinationVariable String code, JsonNode data) {
        if(this.activateUser(code)) {
            Battleship game = this.getCurrentGame(Battleship.class);
            if(game != null) {
                return game.getGameData(this.user);
            }
        }
        return null;
    }

    @MessageMapping("/game/battleship/setValue/{code}")
    @SendTo("/game/battleship/listen/{code}")
    public BattleshipTaticalData handleInput(@DestinationVariable String code, JsonNode data) {
        if (this.activateUser(code)) {
            Battleship game = this.getCurrentGame(Battleship.class);
            if (game != null) {
                game.fireBolt(this.user,
                        data.get("x").asInt(),
                        data.get("y").asInt());
                return game.getGameData(this.user);
            }
        }
        return null;
    }
}
