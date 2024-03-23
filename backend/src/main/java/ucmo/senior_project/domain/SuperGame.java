package ucmo.senior_project.domain;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;
import ucmo.senior_project.domain.gametypes.*;

import java.lang.reflect.InvocationTargetException;
import java.nio.charset.Charset;
import java.util.*;
import java.util.stream.Stream;

@Data
public class SuperGame implements Runnable{
    public static Class[] loadableGames = new Class[]
    {
        DebugGame.class,
        //Battleship.class,
        //HangMan.class,
        //Sudoku.class,
        //TicTacToe.class,
    };

    public static Map<String, SuperGame> activeGames = Collections.synchronizedMap(new HashMap<>());

    private List<TempUser> users = new ArrayList<>();

    private SuperGame(String code, GameUser user) {
        this.code = code;
        this.gameMaster = new TempUser(this, user, this.code);
        this.users.add(this.gameMaster);
        activeGames.put(code, this);
    }

    private TempUser gameMaster;
    private Game currentGame = null;
    private String code;

    public synchronized void updateInput(TempUser user, JsonNode userInputs) {
        if (currentGame != null) {
            currentGame.updateInput(user, userInputs);
        }
        JsonNode adminNode = userInputs.get("admin");
        if(adminNode != null && user == gameMaster) {
            JsonNode gameState = adminNode.get("state");
            if(gameState != null) {
                switch (gameState.asText()) {
                    case "start":
                        this.beginNewGame();
                        break;
                }
            }
        }
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
    public synchronized TempUser newTempUser(String name) {
        TempUser user = new TempUser(this, name, this.code);
        this.users.add(user);
        return user;
    }

    public static SuperGame fetchGame(String code) {
        return activeGames.get(code);
    }
    public static SuperGame setupGame(GameUser user) {
        int leftLimit = 97; // letter 'a'
        int rightLimit = 122; // letter 'z'
        int targetStringLength = 10;
        Random random = new Random();

        String generatedString = random.ints(leftLimit, rightLimit + 1)
                .limit(targetStringLength)
                .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
                .toString();
        SuperGame superGame = new SuperGame(generatedString, user);
        new Thread(superGame).start();
        return superGame;
    }
    public synchronized boolean maintainGame() {
        if (this.currentGame != null) {
            this.currentGame.updateSystem();
        }
        this.users.removeIf(TempUser::isInactive);
        Collection<TempUser> toRemove = this.users.stream().filter(TempUser::isInactive).toList();
        this.users.removeAll(toRemove); //remove from game
        toRemove.forEach(TempUser::destroy); //remove from tempUser container
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
