package com.example.messagingstompwebsocket.model;

import java.util.List;

public class BattleshipGameData {
    private List<BattleshipPlayerGameDataItem> playerGameData;
    private int turn = 0;
    private int next = 0;
    private int[] selectedCell;

    public BattleshipGameData(List<BattleshipPlayerGameDataItem> playerGameData, int turn, int next, int[] selectedCell) {
        this.playerGameData = playerGameData;
        this.turn = turn;
        this.next = next;
        this.selectedCell = selectedCell;
    }

    public List<BattleshipPlayerGameDataItem> getPlayerGameData() {
        return playerGameData;
    }

    public void setPlayerGameData(List<BattleshipPlayerGameDataItem> playerGameData) {
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
