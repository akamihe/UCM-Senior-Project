package ucmo.senior_project.domain.gametypes;

public class BattleshipPlayerGameData {
    private int playerId;
    private boolean[][] board;
    private int[][][] ships;
    private int attacking;

    public BattleshipPlayerGameData(int playerId, boolean[][] board, int[][][] ships, int attacking) {
        this.playerId = playerId;
        this.board = board;
        this.ships = ships;
        this.attacking = attacking;
    }

    public int getPlayerId() {
        return playerId;
    }

    public void setPlayerId(int playerId) {
        this.playerId = playerId;
    }

    public boolean[][] getBoard() {
        return board;
    }

    public void setBoard(boolean[][] board) {
        this.board = board;
    }

    public int[][][] getShips() {
        return ships;
    }

    public void setShips(int[][][] ships) {
        this.ships = ships;
    }

    public int getAttacking() {
        return attacking;
    }

    public void setAttacking(int attacking) {
        this.attacking = attacking;
    }
}
