package ucmo.senior_project.domain.gametypes;

import java.util.*;

public class PictionaryGameData {
    public final static String[] wordBank = {
            "Apple", "Banana", "Car", "Dog", "Elephant", "Fish", "Guitar", "House", "Ice Cream",
            "Kite", "Lion", "Moon", "Noon", "Octopus", "Penguin", "Queen", "Rocket", "Saturn",
            "Sun", "Tree", "Umbrella", "Violin", "Watermelon", "Xylophone", "Zebra",
            "Ant", "Basketball", "Cat",  "Dolphin", "Eagle", "Fire", "Glasses", "Giraffe",
            "Helicopter", "Island", "Jellyfish", "Kangaroo", "Lemon", "Mountain", "Notebook",
            "Owl", "Orion", "Plane", "Piano", "Rocket", "Rabbit", "Spider", "Train", "Unicorn",
            "Violin", "Waterfall", "X-ray"
    };
    private static final Random random = new Random();

    private String word;
    private int artist;
    private PictionaryStroke[] canvasData;
    private Integer correctGuessPlayerId;
    private List<String> usedWords;
    private boolean[] finishedDrawing;

    public PictionaryGameData(String word, int artist, PictionaryStroke[] canvasData,
                              Integer correctGuessPlayerId, boolean[] finishedDrawing) {
        this.word = word;
        this.artist = artist;
        this.canvasData = canvasData;
        this.correctGuessPlayerId = correctGuessPlayerId;
        this.usedWords = new ArrayList<>();
        this.finishedDrawing = finishedDrawing;
    }

    public static String getRandomWord() {
        int wordIndex = random.nextInt(wordBank.length);
        return wordBank[wordIndex];
    };

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

    public Integer getCorrectGuessPlayerId() {
        return correctGuessPlayerId;
    }

    public void setCorrectGuessPlayerId(Integer correctGuessPlayerId) {
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
