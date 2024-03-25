package com.example.messagingstompwebsocket.model;

import java.util.*;

public class PictionaryGameData {
    private String word;
    private int artist;
    private PictionaryStroke[] canvasData;
    private String correctGuessPlayerId;
    private List<String> usedWords;
    private boolean[] finishedDrawing;

    public PictionaryGameData(String word, int artist, PictionaryStroke[] canvasData,
                              String correctGuessPlayerId, boolean[] finishedDrawing) {
        this.word = word;
        this.artist = artist;
        this.canvasData = canvasData;
        this.correctGuessPlayerId = correctGuessPlayerId;
        this.usedWords = new ArrayList<>();
        this.finishedDrawing = finishedDrawing;
    }

    public String getWord() {
        return word;
    }

    public void setWord(String word) {
        this.word = word;
    }

    public int getArtist() {
        return artist;
    }

    public void setArtist(int artist) {
        this.artist = artist;
    }

    public PictionaryStroke[] getCanvasData() {
        return canvasData;
    }

    public void setCanvasData(PictionaryStroke[] canvasData) {
        this.canvasData = canvasData;
    }

    public String getCorrectGuessPlayerId() {
        return correctGuessPlayerId;
    }

    public void setCorrectGuessPlayerId(String correctGuessPlayerId) {
        this.correctGuessPlayerId = correctGuessPlayerId;
    }

    public List<String> getUsedWords() {
        return usedWords;
    }

    public void setUsedWords(List<String> usedWords) {
        this.usedWords = usedWords;
    }

    public boolean[] getFinishedDrawing() {
        return finishedDrawing;
    }

    public void setFinishedDrawing(boolean[] finishedDrawing) {
        this.finishedDrawing = finishedDrawing;
    }
}
