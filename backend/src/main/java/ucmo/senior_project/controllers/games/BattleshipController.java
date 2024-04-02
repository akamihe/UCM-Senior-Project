package ucmo.senior_project.controllers.games;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import ucmo.senior_project.domain.GameBroker;
import ucmo.senior_project.domain.GameUser;
import ucmo.senior_project.domain.gametypes.BattleshipGameData;
import ucmo.senior_project.domain.gametypes.BattleshipPlayerGameData;

import java.util.ArrayList;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class BattleshipController {
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/game/battleshipInitGame/{code}")
    @SendTo("/game/battleshipInitGame/{code}")
    public BattleshipGameData battleshipInitGame(@DestinationVariable String code) throws Exception {
        GameBroker game = GameBroker.fetchGame(code);
        game.onGameInit();

        List<BattleshipPlayerGameData> playerGameData = new ArrayList<>();
        int turn = 0;

        for (int i = 0; i < game.getUsers().size(); i++) {
            int attacking = (i + 1) % game.getUsers().size();
            int[][][] ships = {
//                                { {0, 3}, {0, 4}, {0, 5}, {0, 6} },
//                                { {3, 1}, {4, 1}, {5, 1} },
//                                { {5, 8} },
                    { {8, 4}, {8, 5} },
//                                { {8, 9}, {9, 9} }
            };

            // TODO: Ensure that player is not attacking disconnected player

            var item = new BattleshipPlayerGameData(
                    game.getUsers().get(i).getInstanceId(),
                    new boolean[10][10],
                    ships,
                    attacking
            );

            playerGameData.add(item);
        }

        // TODO: Ensure that it is the first connected player's turn

        game.setBattleshipGameData(new BattleshipGameData(playerGameData, turn, 0, null));
        return game.getBattleshipGameData();
    }

    @MessageMapping("/game/battleshipSelectCell/{code}")
    public void battleshipSelectCell(@DestinationVariable String code, JsonNode node) throws Exception {
        GameBroker game = GameBroker.fetchGame(code);
        int row = node.get("row").asInt();
        int col = node.get("col").asInt();

        int numLeft = 0;

        for (int i = 0; i < game.getUsers().size(); i++)
            if (!game.getUsers().get(i).isDone())
                numLeft++;

        BattleshipGameData gameData = game.getBattleshipGameData();
        List<BattleshipPlayerGameData> playerGameData = gameData.getPlayerGameData();
        int turn = gameData.getTurn();
        int next;

        BattleshipPlayerGameData attacker = playerGameData.get(turn);
        int attackedIndex = playerGameData.get(turn).getAttacking();
        BattleshipPlayerGameData attacked = playerGameData.get(attackedIndex);
        boolean[][] board = attacked.getBoard();
        int[][][] ships = attacked.getShips();

        board[row][col] = true;

        boolean allShipsSunk = true;

        for (int[][] ship : ships) {
            for (int[] cell : ship) {
                if (!board[cell[0]][cell[1]]) {
                    allShipsSunk = false;
                    break;
                }
            }
        }

        if (allShipsSunk) {
            for (int i = 0; i < game.getUsers().size(); i++) {
                GameUser user = game.getUsers().get(i);

                if (attacked.getPlayerId() == user.getInstanceId())
                    user.setDone(true);
                else if (attacker.getPlayerId() == user.getInstanceId())
                    user.setCurrentScore(user.getCurrentScore() + (numLeft == 2 ? 50 : 25));
            }

            next = -1;
            messagingTemplate.convertAndSend("/broker/updateGameState/" + code, game.toData());
        } else {
            turn = attackedIndex;
            next = attackedIndex;
        }

        gameData.setNext(next);
        gameData.setSelectedCell(new int[] { row, col });

        messagingTemplate.convertAndSend("/game/battleshipUpdateGame/" + code, gameData);

        // For local variables to be used inside Threads, they must an unchanged variable
        boolean finalAllShipsSunk = allShipsSunk;
        int finalNumLeft = numLeft;
        int finalTurn = turn;

        Thread thread = new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    Thread.sleep(3000);

                    if (finalAllShipsSunk) {
                        if (finalNumLeft > 2) {
                            playerGameData.get(finalTurn).setAttacking(attacked.getAttacking());
                            gameData.setSelectedCell(null);
                        }
                    } else {
                        gameData.setTurn(finalTurn);
                        gameData.setSelectedCell(null);
                    }

                    messagingTemplate.convertAndSend("/game/battleshipUpdateGame/" + code, gameData);
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }
        });

        thread.start();
    }
}
