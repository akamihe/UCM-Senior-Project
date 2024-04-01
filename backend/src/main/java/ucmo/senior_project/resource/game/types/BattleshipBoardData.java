package ucmo.senior_project.resource.game.types;

import lombok.Data;

@Data
public class BattleshipBoardData {

    public static final byte NO_STRIKES = 0;
    public static final byte MISS = 1;
    public static final byte HIT = 2;
    private int[][] board;

    public BattleshipBoardData() {
        this.board = new int[10][10];
    }

    public void setValueAt(int x, int y, byte data) {
        this.board[x][y] = data;
    }
}
