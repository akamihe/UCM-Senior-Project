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
import ucmo.senior_project.domain.gametypes.Sudoku;
import ucmo.senior_project.resource.game.types.SudokuData;

@RestController
@CrossOrigin
@RequestMapping
@RequiredArgsConstructor
public class SudokuController extends AbstractGameBrokerController {


    @MessageMapping("/game/sudoku/listen/{code}")
    @SendTo("/game/sudoku/listen/{code}")
    public SudokuData handleWakeCall(@DestinationVariable String code, JsonNode data) {
        if(this.activateUser(code)) {
            Sudoku game = this.getCurrentGame(Sudoku.class);
            if(game != null) {
                return game.getGameData(this.user);
            }
        }
        return null;
    }

    @MessageMapping("/game/sudoku/setValue/{code}")
    @SendTo("/game/sudoku/listen/{code}")
    public SudokuData handleInput(@DestinationVariable String code, JsonNode data) {
        if (this.activateUser(code)) {
            Sudoku game = this.getCurrentGame(Sudoku.class);
            if (game != null) {
                SudokuData gameData = game.getGameData(this.user);
                gameData.setGridAt(
                        data.get("x").asInt(),
                        data.get("y").asInt(),
                        data.get("value").asInt()
                    );
                return gameData;
            }
        }
        return null;
    }
}