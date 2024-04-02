package ucmo.senior_project.domain.gametypes;

import java.util.List;

public class BattleshipGameData {
    private List<BattleshipPlayerGameData> playerGameData;
    private int turn = 0;
    private int next = 0;
    private int[] selectedCell;

    public BattleshipGameData(List<BattleshipPlayerGameData> playerGameData, int turn, int next, int[] selectedCell) {
        this.playerGameData = playerGameData;
        this.turn = turn;
        this.next = next;
        this.selectedCell = selectedCell;
    }

    public List<BattleshipPlayerGameData> getPlayerGameData() {
        return playerGameData;
    }

    public void setPlayerGameData(List<BattleshipPlayerGameData> playerGameData) {
        this.playerGameData = playerGameData;
    }

    public int getTurn() {
        return turn;
    }

    public void setTurn(int turn) {
        this.turn = turn;
    }

    public int getNext() {
        return next;
    }

    public void setNext(int next) {
        this.next = next;
    }

    public int[] getSelectedCell() {
        return selectedCell;
    }

    public void setSelectedCell(int[] selectedCell) {
        this.selectedCell = selectedCell;
    }
}
