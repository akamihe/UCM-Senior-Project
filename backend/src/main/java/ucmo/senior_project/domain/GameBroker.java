package ucmo.senior_project.domain;

import lombok.Data;
import ucmo.senior_project.domain.gametypes.*;
import ucmo.senior_project.resource.input.ActiveGames;

import java.lang.reflect.InvocationTargetException;
import java.util.*;

@Data
public class GameBroker implements Runnable{

    public static int ENDGAME_POINT_REWARD_PER_PLAYER = 50;

    public static Class<Game>[] loadableGames = new Class[]
    {
        //DebugGame.class,
        Battleship.class,
        //HangMan.class,
        Sudoku.class,
        //TicTacToe.class,
    };

    public static Map<String, GameBroker> activeGames = Collections.synchronizedMap(new HashMap<>());

    private List<GameUser> users = new ArrayList<>();

    private LinkedList<Game> nextGames = new LinkedList<>();

    public static final long TIME_BETWEEN_GAMES = 1000*10; //10 seconds;

    private long nextGameStartTime = 0;

    private GameBroker(String code, AuthUser user) {
        this.code = code;
        this.gameMaster = new GameUser(this, user, this.code);
        this.users.add(this.gameMaster);
        activeGames.put(code, this);
    }

    private GameUser gameMaster;
    private Game currentGame = null;
    private String code;

    public synchronized void wake(GameUser user) {

    }
    public boolean isBetweenGames() {
        return this.nextGameStartTime != 0 && !this.nextGames.isEmpty() && this.currentGame == null;
    }
    public boolean isFinished() {
        return nextGameStartTime != 0 && this.nextGames.isEmpty();
    }

    public synchronized void beginGame(ActiveGames active) {
        List<Class<Game>> games = Arrays.stream(loadableGames)
                .filter(e -> active.getList().contains(e.getSimpleName())).toList();
        for(int i = 0; i < Math.max(2, games.size()); i ++) {
            int rnd = new Random().nextInt(loadableGames.length); //todo, allow selcetion of what games to play.
            try {
                this.nextGames.add(loadableGames[rnd].getDeclaredConstructor().newInstance());
                //this.currentGame = (Game);
                //this.currentGame.init(this.users);
            } catch (InstantiationException | IllegalAccessException | InvocationTargetException |
                     NoSuchMethodException e) {
                throw new RuntimeException(e);
            }
        }
    }
    public synchronized GameUser newGameUser(String name) {
        GameUser user = new GameUser(this, name, this.code);
        this.users.add(user);
        return user;
    }

    public synchronized GameUser newGameUserFromAuthUser(AuthUser authUser) {
        GameUser user = new GameUser(this, authUser, this.code);
        this.users.add(user);
        return user;
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
        new Thread(gameBroker).start();
        return gameBroker;
    }
    public synchronized boolean maintainGame() {
        if (this.currentGame != null) {
            if(!this.currentGame.updateSystem()) {
                this.currentGame.finish(this.users);
                this.currentGame = null;
                this.nextGameStartTime = System.currentTimeMillis() + TIME_BETWEEN_GAMES;
            }
        }
        //handle next game protocols
        else if (this.nextGameStartTime < System.currentTimeMillis()){
            if(!this.nextGames.isEmpty()) {
                this.currentGame = this.nextGames.pop();
                this.currentGame.init(this.users);
            }
        }
        Collection<GameUser> toRemove = this.users.stream().filter(GameUser::isInactive).toList();
        this.users.removeAll(toRemove); //remove from game
        toRemove.forEach(GameUser::destroy); //remove from gameUser container
        return !this.users.isEmpty(); //end game if all users have left
    }
    @Override
    public void run() {
        while (this.maintainGame()) {
            try {
                Thread.sleep(1000); //sleep 1 second
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
        }
        //destory the game instance
        activeGames.remove(this.code); //allow java to delete the game now
    }
}
