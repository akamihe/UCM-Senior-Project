package ucmo.senior_project.controllers.games;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import ucmo.senior_project.domain.GameBroker;
import ucmo.senior_project.domain.data.GameBrokerData;
import ucmo.senior_project.domain.GameUser;
import ucmo.senior_project.domain.gametypes.SudokuPuzzle;

@Controller
@RequiredArgsConstructor
public class SudokuController {
    @MessageMapping("/game/sudokuInitGame/{code}")
    @SendTo("/game/sudokuInitGame/{code}")
    public SudokuPuzzle sudokuInitGame(@DestinationVariable String code) {
        GameBroker game = GameBroker.fetchGame(code);
        game.onGameInit();

        if (game.getSudokuPuzzle() == null)
            game.setSudokuPuzzle(new SudokuPuzzle());

        return game.getSudokuPuzzle();
    }

    @MessageMapping("/game/sudokuFinish/{code}")
    @SendTo("/broker/updateGameState/{code}")
    public GameBrokerData sudokuFinish(@DestinationVariable String code, JsonNode data) throws Exception {
        GameBroker game = GameBroker.fetchGame(code);
        ObjectMapper mapper = new ObjectMapper();
        GameUser user = mapper.convertValue(data.get("user"), GameUser.class);
        boolean timerEnded = data.get("timerEnded").asBoolean();

        int numDone = 0;

        for (int i = 0; i < game.getUsers().size(); i++)
            if (game.getUsers().get(i).isDone())
                numDone++;

        for (int i = 0; i < game.getUsers().size(); i++) {
            GameUser gameUser = game.getUsers().get(i);

            if (gameUser.getInstanceId() == user.getInstanceId()) {
                if (!timerEnded) {
                    int ptsAwarded = 10;
                    if (numDone == 0)
                        ptsAwarded = 50;
                    else if (numDone == 1)
                        ptsAwarded = 25;

                    gameUser.setCurrentScore(gameUser.getCurrentScore() + ptsAwarded);
                }

                gameUser.setDone(true);
            }
        }

        return game.toData();
    }
}