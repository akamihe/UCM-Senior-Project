package ucmo.senior_project.resource.game.types;

import ucmo.senior_project.domain.GameUser;
import ucmo.senior_project.resource.game.GameData;
import java.util.HashMap;
import java.util.Map;

public class DotsAndBoxesData implements GameData {
    private final Map<String, Integer> lineCoordinates = new HashMap<>();
    private final Map<String, String> boxColors = new HashMap<>();
    private int boardSize = 8;
    private int[] playerScores = new int[4]; // Assuming 4 players
    private int turn = 1; // Player turn
    private String winMessage = "";

    public Map<String, Object> getGameStateForTransmission() {
        Map<String, Object> transmissionData = new HashMap<>();
        // Add all necessary game state data
        transmissionData.putAll(lineCoordinates); // Adjust as necessary for your data structure
        transmissionData.put("boardSize", this.boardSize);
        transmissionData.put("turn", this.turn);
        transmissionData.put("winMessage", this.winMessage);
        // Convert playerScores to individual counts
        transmissionData.put("numRed", this.playerScores[0]);
        transmissionData.put("numGreen", this.playerScores[1]);
        transmissionData.put("numBlue", this.playerScores[2]);
        transmissionData.put("numYellow", this.playerScores[3]);

        return transmissionData;
    }

    public boolean isDataComplete() {
        return boardSize > 0 && lineCoordinates != null && !lineCoordinates.isEmpty() && boxColors != null;
    }

    public DotsAndBoxesData(int boardSize) {
        this.boardSize = boardSize;
        initializeBoard();
    }

    public boolean isReadyToSend() {
        return isDataComplete() && !lineCoordinates.containsValue(0);
    }

    private void initializeBoard() {
        this.boardSize = 8; // Assuming a default board size
        for (int i = 0; i < 2; i++) {
            for (int j = 0; j < boardSize; j++) {
                for (int k = 0; k < boardSize + (i == 0 ? 1 : 0); k++) {
                    String key = String.format("%d,%d,%d", i, j, k);
                    lineCoordinates.putIfAbsent(key, 0);
                }
            }
        }
    }

    public boolean drawLine(int i, int j, int k, GameUser user) {
        int playerId = user.getSourceUser();
        String key = String.format("%d,%d,%d", i, j, k);
        if (lineCoordinates.getOrDefault(key, 0) != 0) {
            return false; // Line already drawn
        }


        lineCoordinates.put(key, playerId);
        boolean completedBox = checkAndFillBoxes(i, j, k, playerId);

        if (completedBox) {
            // If a box is completed, update the player's score.
            playerScores[playerId - 1]++;
            // Check if the game is over and update the winMessage if so.
            if (checkGameOver()) {
                int maxScore = 0;
                int winningPlayer = -1;
                for (int p = 0; p < playerScores.length; p++) {
                    if (playerScores[p] > maxScore) {
                        maxScore = playerScores[p];
                        winningPlayer = p + 1; // Adjust for 0-indexing
                    }
                }
                winMessage = "Player " + winningPlayer + " wins with " + maxScore + " boxes!";
            }
        } else {
            // Advance to the next player's turn if no box was completed.
            turn = (turn % 4) + 1;
        }

        return true;
    }

    private boolean hasSquareCompleted(int j, int k) {
        // Keys for the four sides of the square
        String top = String.format("0,%d,%d", j, k);
        String bottom = String.format("0,%d,%d", j + 1, k);
        String left = String.format("1,%d,%d", j, k);
        String right = String.format("1,%d,%d", j, k + 1);

        // Check if all sides are drawn
        return lineCoordinates.getOrDefault(top, 0) != 0 &&
                lineCoordinates.getOrDefault(bottom, 0) != 0 &&
                lineCoordinates.getOrDefault(left, 0) != 0 &&
                lineCoordinates.getOrDefault(right, 0) != 0;
    }

    private boolean checkAndFillBoxes(int i, int j, int k, int playerId) {
        boolean completedBox = false;

        // Check for a completed box based on the line drawn (i, j, k)
        // For horizontal lines (i == 0), check the boxes above and below the line
        if (i == 0) {
            if (j > 0 && hasSquareCompleted(j - 1, k)) {
                boxColors.put(String.format("%d,%d", j - 1, k), "player" + playerId);
                completedBox = true;
                playerScores[playerId - 1]++;  // Increment the score for the current player
            }
            if (j < boardSize - 1 && hasSquareCompleted(j, k)) {
                boxColors.put(String.format("%d,%d", j, k), "player" + playerId);
                completedBox = true;
                playerScores[playerId - 1]++;  // Increment the score for the current player
            }
        }
        // For vertical lines (i == 1), check the boxes to the left and right of the line
        else if (i == 1) {
            if (k > 0 && hasSquareCompleted(j, k - 1)) {
                boxColors.put(String.format("%d,%d", j, k - 1), "player" + playerId);
                completedBox = true;
                playerScores[playerId - 1]++;  // Increment the score for the current player
            }
            if (k < boardSize - 1 && hasSquareCompleted(j, k)) {
                boxColors.put(String.format("%d,%d", j, k), "player" + playerId);
                completedBox = true;
                playerScores[playerId - 1]++;  // Increment the score for the current player
            }
        }

        return completedBox;
    }

    public boolean checkGameOver() {
        int totalLines = boardSize * (boardSize + 1) * 2;
        long linesDrawn = lineCoordinates.values().stream().filter(val -> val > 0).count();

        if (linesDrawn == totalLines) {
            // Calculate and determine the winner
            // Set `winMessage` accordingly
            return true;
        }
        return false;
    }

    // Getters and Setters

    public Map<String, Integer> getLineCoordinates() {
        return lineCoordinates;
    }

    public Map<String, String> getBoxColors() {
        return boxColors;
    }

    public int[] getPlayerScores() {
        return playerScores;
    }

    public String getWinMessage() {
        return winMessage;
    }

    public int getTurn() {
        return turn;
    }
}
