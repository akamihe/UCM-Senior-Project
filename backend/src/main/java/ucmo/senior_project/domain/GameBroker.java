package ucmo.senior_project.domain;

import lombok.Data;
import ucmo.senior_project.domain.data.GameBrokerData;
import ucmo.senior_project.domain.gametypes.*;

import java.util.*;

@Data
public class GameBroker {
    public static Map<String, GameBroker> activeGames = Collections.synchronizedMap(new HashMap<>());
    public static int MAX_NUM_PLAYERS = 6;
    public static String[] allGames = { "Sudoku", "Battleship", "Pictionary" };

    private Timer timer = null;
    private final Random random = new Random();

    private String code;
    private List<GameUser> users = new ArrayList<>();
    private List<String> games = new ArrayList<>();
    private int gameNum;

    private SudokuPuzzle sudokuPuzzle = null;
    private BattleshipGameData battleshipGameData = null;
    private PictionaryGameData pictionaryGameData = null;

    private GameBroker(String code, AuthUser user) {
        this.code = code;
        this.users.add(new GameUser(this, user, this.code, true));

        while (games.size() < 3) {
            String game = allGames[random.nextInt(allGames.length)];
            if (!games.contains(game))
                games.add(game);
        }

//        this.games.add("Sudoku");
//        this.games.add("Battleship");
//        this.games.add("Pictionary");

        activeGames.put(code, this);
    }

    public synchronized GameUser addUser(String name) {
        GameUser user = new GameUser(this, name, this.code);
        this.users.add(user);
        return user;
    }

    // To avoid an IllegalStateException, there must be some way of checking that
    // the timer is already cancelled. The Timer class does not have that, so the timer
    // is set to null after the cancel method executes. See schedule(task, seconds) below.
    public void cancelTimer() {
        if (this.timer != null) {
            this.timer.cancel();
            this.timer = null;
        }
    }

    public static GameBroker fetchGame(String code) {
        return activeGames.get(code);
    }
    public static GameBroker setupGame(AuthUser user) {
        int leftLimit = 97; // letter 'a'
        int rightLimit = 122; // letter 'z'
        int targetStringLength = 10;
        Random random = new Random();

        String generatedString = random.ints(leftLimit, rightLimit + 1)
                .limit(targetStringLength)
                .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
                .toString();
        GameBroker gameBroker = new GameBroker(generatedString, user);
        return gameBroker;
    }

    public void onGameInit() {
        this.cancelTimer();
        for (GameUser user : this.users)
            user.setPreviousScore(user.getCurrentScore());
    }

    public void resetGameData() {
        this.sudokuPuzzle = null;
        this.battleshipGameData = null;
        this.pictionaryGameData = null;
    }

    public void schedule(TimerTask task, long seconds) {
        if (this.timer == null)
            this.timer = new Timer();
        this.timer.schedule(task, seconds * 1000);
    }

    public GameBrokerData toData() {
        GameBrokerData data = new GameBrokerData();

        data.setCode(this.code);
        data.setUsers(this.users.stream().map(GameUser::toData).toList());
        data.setGames(this.games);
        data.setGameNum(this.gameNum);

        return data;
    }
}
