package com.example.messagingstompwebsocket.model;

public class BattleshipPlayerGameDataItem {
    private String playerId;
    private boolean[][] board;
    private int[][][] ships;
    private int attacking;

    public BattleshipPlayerGameDataItem(String playerId, boolean[][] board, int[][][] ships, int attacking) {
        this.playerId = playerId;
        this.board = board;
        this.ships = ships;
        this.attacking = attacking;
    }

    public String getPlayerId() {
        return playerId;
    }

    public void setPlayerId(String playerId) {
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
