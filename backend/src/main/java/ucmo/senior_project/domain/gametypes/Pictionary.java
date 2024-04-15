package ucmo.senior_project.domain.gametypes;

import com.fasterxml.jackson.databind.JsonNode;
import ucmo.senior_project.domain.Game;
import ucmo.senior_project.domain.GameUser;
import ucmo.senior_project.resource.auth.UserData;
import ucmo.senior_project.resource.game.GameData;
import ucmo.senior_project.resource.game.types.PictionaryData;

import java.util.*;
import java.util.function.BiConsumer;
import java.util.stream.Collectors;

public class Pictionary  implements Game {
    public final static String[] WORD_BANK = {
            "Apple", "Banana", "Car", "Dog", "Elephant", "Fish", "Guitar", "House", "Ice Cream",
            "Kite", "Lion", "Moon", "Noon", "Octopus", "Penguin", "Queen", "Rocket", "Saturn",
            "Sun", "Tree", "Umbrella", "Violin", "Watermelon", "Xylophone", "Zebra",
            "Ant", "Basketball", "Cat",  "Dolphin", "Eagle", "Fire", "Glasses", "Giraffe",
            "Helicopter", "Island", "Jellyfish", "Kangaroo", "Lemon", "Mountain", "Notebook",
            "Owl", "Orion", "Plane", "Piano", "Rocket", "Rabbit", "Spider", "Train", "Unicorn",
            "Violin", "Waterfall", "X-ray"
    };
    public static final int PHASE_ROUND_ACTIVE = 1;
    public static final int PHASE_ROUND_OVER = 2;

    public static int START_ROUND_DRAWING_TIME = 5*1000;
    public static int ACTIVE_ROUND_TiME = 30*1000;
    public static int ROUND_OVER_TIME = 5*1000;

    private static final Random random = new Random();

    private String word;

    private GameUser artist;
    private int artistTurn;
    private PictionaryStroke[] canvasData;
    private GameUser roundWinner;

    private List<GameUser> usersOrder = new ArrayList<>();
    private Map<GameUser, Double> scores = new HashMap<>();
    private Map<GameUser, Integer> guessStatus = new HashMap<>();

    private int phase;
    private long time;

    private static String getRandomWord() {
        int wordIndex = random.nextInt(WORD_BANK.length);
        return WORD_BANK[wordIndex];
    };

    private void beginNewRound() {
        this.guessStatus.putAll(usersOrder.stream().collect(Collectors.toMap(e-> e, e -> 0)));
        this.word = getRandomWord();
        this.canvasData = new PictionaryStroke[0];
        this.artist = this.usersOrder.get(artistTurn);
        this.roundWinner = null;
        this.phase = PHASE_ROUND_ACTIVE;
        this.time = ACTIVE_ROUND_TiME + System.currentTimeMillis();
    }
    private void finishRound() {
        this.artistTurn++;
        this.artist = null;
        this.phase = PHASE_ROUND_OVER;
        this.time = ROUND_OVER_TIME + System.currentTimeMillis();
    }


    @Override
    public PictionaryData getGameData(GameUser user) {
        long timeRemaining = time - System.currentTimeMillis();
        if (user.equals(this.artist)) {

            return new PictionaryData(
                new UserData(this.artist),
                this.word,
                this.canvasData,
                this.roundWinner == null ? null : new UserData(this.roundWinner),
                true,
                false,
                false,
                this.phase == PHASE_ROUND_OVER,
                timeRemaining
            );
        } else {
            return new PictionaryData(
                    this.artist == null ? null : new UserData(this.artist),
                    phase == PHASE_ROUND_ACTIVE ? null : this.word,
                    this.canvasData,
                    this.roundWinner == null ? null :new UserData(this.roundWinner),
                    false,
                    this.guessStatus.get(user) == 1,
                    this.guessStatus.get(user) == 2,
                    this.phase == PHASE_ROUND_OVER,
                    timeRemaining
            );
        }
    }
    public String getWord() {
        return word;
    }

    public void setWord(String word) {
        this.word = word;
    }

    public void guessWord(GameUser inputUser, String word) {
        if (this.phase == PHASE_ROUND_ACTIVE && this.word.toLowerCase().equals(word.toLowerCase().trim())) {
            this.roundWinner = inputUser;
            this.scores.put(this.roundWinner, this.scores.get(this.roundWinner)+20d) ;
            this.guessStatus.put(inputUser, 1);
            this.finishRound();
        } else {
            this.guessStatus.put(inputUser, 2);
        }
    }
    public void setPictionaryStroke(GameUser user, PictionaryStroke[] data) {
        if(user.equals(artist)) {
            this.canvasData = data;
        }
    }
    public PictionaryStroke[] getCanvasData() {
        return canvasData;
    }
    @Override
    public void updateInput(GameUser user, JsonNode data) {

    }

    @Override
    public boolean updateSystem() {
        long timeRemaining = time - System.currentTimeMillis();
        if (timeRemaining < 0) {
            switch (phase) {
                case PHASE_ROUND_ACTIVE:
                    this.finishRound();
                    break;
                case PHASE_ROUND_OVER:
                    //expedite time
                    this.beginNewRound();
                    break;
            }
        }
        return this.usersOrder.size() != this.artistTurn;
    }

    @Override
    public void init(List<GameUser> users) {
        this.scores.putAll(users.stream().collect(Collectors.toMap(e-> e, e -> 0d)));
        this.guessStatus.putAll(users.stream().collect(Collectors.toMap(e-> e, e -> 0)));
        this.usersOrder.addAll(users);
        this.artistTurn = 0;
        this.beginNewRound();
    }

    @Override
    public void finish(List<GameUser> users) {
        this.scores.forEach(GameUser::updateScore);
    }
}
