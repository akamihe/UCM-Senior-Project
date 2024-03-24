package ucmo.senior_project.domain;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;
import ucmo.senior_project.domain.gametypes.*;

import java.lang.reflect.InvocationTargetException;
import java.util.*;

@Data
public class GameBroker implements Runnable{
    public static Class[] loadableGames = new Class[]
    {
        DebugGame.class,
        //Battleship.class,
        //HangMan.class,
        //Sudoku.class,
        //TicTacToe.class,
    };

    public static Map<String, GameBroker> activeGames = Collections.synchronizedMap(new HashMap<>());

    private List<GameUser> users = new ArrayList<>();

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

    public synchronized void beginNewGame() {
        int rnd = new Random().nextInt(loadableGames.length);
        try {
            this.currentGame = (Game)loadableGames[rnd].getDeclaredConstructor().newInstance();
            this.currentGame.init(this.users);
        } catch (InstantiationException | IllegalAccessException | InvocationTargetException | NoSuchMethodException e) {
            throw new RuntimeException(e);
        }
    }
    public synchronized GameUser newgameUser(String name) {
        GameUser user = new GameUser(this, name, this.code);
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
            this.currentGame.updateSystem();
        }
        this.users.removeIf(GameUser::isInactive);
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
