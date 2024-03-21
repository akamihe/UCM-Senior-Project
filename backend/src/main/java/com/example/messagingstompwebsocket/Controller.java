package com.example.messagingstompwebsocket;

import com.example.messagingstompwebsocket.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.*;

@org.springframework.stereotype.Controller
public class Controller implements ApplicationListener<SessionDisconnectEvent> {
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private Timer timer = new Timer();

    private final int MAX_PLAYERS = 5;
    private List<Player> players = new ArrayList<>();
    private final int gameCode = (int)(Math.random() * 900000) + 100000;
    private boolean areGamesInProgress = false;
    private List<Player> playerQueue = new ArrayList<>();

    private SudokuPuzzle sudokuPuzzle = null;
    private BattleshipGameData battleshipGameData = null;

    @MessageMapping("/battleshipInitGame")
    @SendTo("/topic/battleshipInitGame")
    public BattleshipGameData battleshipInitGame() throws Exception {
        if (battleshipGameData == null) {
            updatePlayerPts();
            List<BattleshipPlayerGameDataItem> playerGameData = new ArrayList<>();

            for (int i = 0; i < players.size(); i++) {
                int attacking = (i + 1) % players.size(); // Each player attacks the next (cyclical)
                int[][][] ships = {
//                                { {0, 3}, {0, 4}, {0, 5}, {0, 6} },
//                                { {3, 1}, {4, 1}, {5, 1} },
//                                { {5, 8} },
                        { {8, 4}, {8, 5} },
//                                { {8, 9}, {9, 9} }
                };

                // If the attacked player is disconnected, target the next
                // player that is still connected
                while (players.get(attacking).getIsDisconnected() && attacking != i)
                    attacking = (attacking + 1) % players.size();

                var item = new BattleshipPlayerGameDataItem(
                        players.get(i).getId(),
                        new boolean[10][10],
                        ships,
                        attacking
                );

                playerGameData.add(item);
            }

            int turn = 0;

            // If the player with the current turn (first player) is disconnected,
            // it will now be the turn of the next player that's still connected
            while (turn < players.size() && players.get(turn).getIsDisconnected())
                turn++;

            battleshipGameData = new BattleshipGameData(playerGameData, turn, 0, null);
        }

        return battleshipGameData;
    }

    @MessageMapping("/battleshipUpdateGame")
    @SendTo("/topic/battleshipUpdateGame")
    public BattleshipGameData battleshipUpdateGame(BattleshipGameData newGameData) throws Exception {
        battleshipGameData = newGameData;
        return battleshipGameData;
    }

    @MessageMapping("/clearPlayers")
    public void clearPlayers() throws Exception {
        players.clear();
    }

    public void countDown(int count) {
        // Send to client each time countDown is executed (every second)
        messagingTemplate.convertAndSend("/topic/updateCount", count);

        if (count >= 0) {
            schedule(new TimerTask() {
                @Override
                public void run() {
                    countDown(count - 1);
                }
            }, 1);
        }
    }

    @MessageMapping("/endGame")
    @SendTo("/topic/endGame")
    public String endGame() throws Exception {
        resetGameState();
        messagingTemplate.convertAndSend("/topic/updatePlayers", players);
        return "";
    }

    @MessageMapping("/gameCode")
    @SendTo("/topic/gameCode")
    public int getGameCode() {
        return gameCode;
    }

    @MessageMapping("/sessionId")
    @SendToUser("/queue/sessionId")
    public String getSessionId(@Header("simpSessionId") String sessionId) throws Exception {
        return sessionId;
    }

    @Override
    public void onApplicationEvent(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();

        List<Player> newPlayers = new ArrayList<>();
        List<Player> newPlayerQueue = new ArrayList<>();
        int numDisconnected = 0;

        for (Player player : players){
            if (player != null) {
                boolean didDisconnect = player.getId().equals(sessionId);

                if (didDisconnect)
                    player.setIsDisconnected(true);
                // If game is in progress, only mark players as disconnected instead of removing
                if (areGamesInProgress || !didDisconnect)
                    newPlayers.add(player);

                if (player.getIsDisconnected())
                    numDisconnected++;
            }
        }

        for (Player player : playerQueue)
            if (player != null && !player.getId().equals(sessionId))
                newPlayerQueue.add(player);

        // Right now, the only way to restart the game session is for all players to disconnect
        if (areGamesInProgress && numDisconnected == newPlayers.size()) {
            areGamesInProgress = false;
            resetGameState();
            newPlayers.clear();
        }

        if (!areGamesInProgress)
            // Add any players that were queued/waiting
            while (newPlayers.size() < MAX_PLAYERS && !newPlayerQueue.isEmpty())
                newPlayers.add(newPlayerQueue.remove(0));

        players = newPlayers;
        playerQueue = newPlayerQueue;
        updateHost();

        messagingTemplate.convertAndSend("/topic/updatePlayers", players);

        if (areGamesInProgress)
            messagingTemplate.convertAndSend("/topic/playerDisconnected", players);
    }

    @MessageMapping("/register")
    public void register(@Header("simpSessionId") String sessionId) throws Exception {
        String name = "Player_" + sessionId.substring(0, 4);
        Player player = new Player(sessionId, false, name, 0, 0, false);

        if (!areGamesInProgress && players.size() < MAX_PLAYERS) {
            players.add(player);
            updateHost();
        } else {
            playerQueue.add(player);
        }

        messagingTemplate.convertAndSend("/topic/updatePlayers", players);
    }

    private void resetGameState() {
        // To avoid an IllegalStateException, there must be some way of checking that
        // the timer is already cancelled. The Timer class does not have that, so the timer
        // is set to null after the cancel method executes. See schedule(task, seconds) below.
        if (timer != null) {
            timer.cancel();
            timer = null;
        }

        for (Player player : players)
            player.setDone(false);

        sudokuPuzzle = null;
        battleshipGameData = null;
    }

    private void schedule(TimerTask task, long seconds) {
        if (timer == null)
            timer = new Timer();
        timer.schedule(task, seconds * 1000);
    }

    @MessageMapping("/setTimer")
    public void setTimer(long seconds) throws Exception {
        schedule(new TimerTask() {
            @Override
            public void run() {
                messagingTemplate.convertAndSend("/topic/timerEnded", "");
            }
        }, seconds);
    }

    @MessageMapping("/startCountdown")
    public void startCountdown(int count) throws Exception {
        countDown(count);
    }

    @MessageMapping("/startGames")
    @SendTo("/topic/startGames")
    public String startGames() throws Exception {
        areGamesInProgress = true;
        return "";
    }

    @MessageMapping("/sudokuInitGame")
    @SendTo("/topic/sudokuInitGame")
    public SudokuPuzzle sudokuInitGame() throws Exception {
        if (sudokuPuzzle == null) {
            updatePlayerPts();
            sudokuPuzzle = new SudokuPuzzle();
        }

        return sudokuPuzzle;
    }

    private void updateHost() {
        // For simplicity’s sake, the first player is always the host
        if (!players.isEmpty())
            players.get(0).setIsHost(true);
    }

    private void updatePlayerPts() {
        for (Player player : players) {
            player.setPts(player.getPts() + player.getPtsAwarded()); // Add awarded pts
            player.setPtsAwarded(0);
        }

        messagingTemplate.convertAndSend("/topic/updatePlayers", players);
    }

    @MessageMapping("/updatePlayers")
    @SendTo("/topic/updatePlayers")
    public List<Player> updatePlayers(List<Player> newPlayers) throws Exception {
        players = newPlayers;
        return players;
    }
}