package ucmo.senior_project.controllers.games;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import ucmo.senior_project.domain.GameBroker;
import ucmo.senior_project.domain.GameUser;
import ucmo.senior_project.domain.gametypes.PictionaryGameData;
import ucmo.senior_project.domain.gametypes.PictionaryStroke;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class PictionaryController {
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/game/pictionaryInitGame/{code}")
    @SendTo("/game/pictionaryInitGame/{code}")
    public PictionaryGameData pictionaryInitGame(@DestinationVariable String code) {
        GameBroker game = GameBroker.fetchGame(code);
        game.onGameInit();

        if (game.getPictionaryGameData() == null) {
            PictionaryGameData gameData = new PictionaryGameData(
                    PictionaryGameData.getRandomWord(),
                    0,
                    new PictionaryStroke[]{},
                    null,
                    new boolean[game.getUsers().size()]
            );
            game.setPictionaryGameData(gameData);
        }

        return game.getPictionaryGameData();
    }

    @MessageMapping("/game/pictionaryUpdateCanvasData/{code}")
    @SendTo("/game/pictionaryUpdateGame/{code}")
    public PictionaryGameData updateCanvasData(@DestinationVariable String code, PictionaryStroke[] canvasData) {
        GameBroker game = GameBroker.fetchGame(code);
        game.getPictionaryGameData().setCanvasData(canvasData);
        return game.getPictionaryGameData();
    }

    @MessageMapping("/game/pictionaryCorrectGuess/{code}")
    public void correctGuess(@DestinationVariable String code, GameUser user) {
        GameBroker game = GameBroker.fetchGame(code);
        game.cancelTimer();

        PictionaryGameData gameData = game.getPictionaryGameData();

        for (int i = 0; i < game.getUsers().size(); i++) {
            GameUser gameUser = game.getUsers().get(i);

            if (i == gameData.getArtist()) {
                gameUser.setCurrentScore(gameUser.getCurrentScore() + 25);
            } else if (gameUser.getInstanceId() == user.getInstanceId()) {
                gameUser.setCurrentScore(gameUser.getCurrentScore() + 25);
                gameData.setCorrectGuessPlayerId(gameUser.getInstanceId());
            }
        }

        messagingTemplate.convertAndSend("/broker/updateGameState/" + code, game.toData());
        messagingTemplate.convertAndSend("/game/pictionaryUpdateGame/" + code, gameData);
        endTurn(game);
    }

    @MessageMapping("/game/pictionaryEndTurn/{code}")
    public void pictionaryEndTurn(@DestinationVariable String code) {
        GameBroker game = GameBroker.fetchGame(code);
        endTurn(game);
    }

    private void endTurn(GameBroker game) {
        Thread thread = new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    Thread.sleep(3000);

                    PictionaryGameData gameData = game.getPictionaryGameData();
                    int artist = gameData.getArtist();
                    boolean[] finishedDrawing = gameData.getFinishedDrawing();
                    List<String> usedWords = gameData.getUsedWords();

                    finishedDrawing[artist] = true;

                    int numFinished = 0;
                    for (boolean bool : finishedDrawing)
                        if (bool) numFinished++;

                    if (numFinished < finishedDrawing.length) {
                        usedWords.add(gameData.getWord());

                        while (usedWords.contains(gameData.getWord()))
                            gameData.setWord(PictionaryGameData.getRandomWord());

                        gameData.setArtist((artist + 1) % game.getUsers().size());
                        gameData.setCanvasData(new PictionaryStroke[] {});
                        gameData.setCorrectGuessPlayerId(null);
                    }

                    messagingTemplate.convertAndSend(
                            "/game/pictionaryUpdateGame/" + game.getCode(),
                            gameData
                    );
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }
        });

        thread.start();
    }
}
