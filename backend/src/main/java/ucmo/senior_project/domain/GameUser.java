package ucmo.senior_project.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.jsonwebtoken.Jwts;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import ucmo.senior_project.domain.data.GameUserData;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Data
@RequiredArgsConstructor
public class GameUser {
    public static long TIMEOUT = 50000; //50 seconds
    private static Map<String, GameUser> gameUsers = Collections.synchronizedMap(new HashMap<>());
    public static int CURRENT_COUNT = 0;

    @JsonIgnore
    private GameBroker instance;

    private Integer sourceUser = null;
    private String code;
    public long lastInteraction = 0;

    private int instanceId = CURRENT_COUNT++;
    private String username;
    private String gameCode;
    private double currentScore = 0;
    private double previousScore = 0;
    private boolean isDone = false;
    private boolean isGameMaster = false;

    public GameUser(GameBroker instance, String username, String gameCode) {
        this.instance = instance;
        this.username = username;
        this.gameCode = gameCode;
        this.code = createCode(instance.getCode());
        gameUsers.put(this.code, this);
    }

    public GameUser(GameBroker instance, AuthUser user, String gameCode, boolean isGameMaster) {
        this.instance = instance;
        this.sourceUser = user.getUserId();
        this.username = user.getUsername();
        this.gameCode = gameCode;
        this.isGameMaster = isGameMaster;
        this.code = createCode(instance.getCode());

        gameUsers.put(this.code, this);
    }

    public static String createCode(String gameCode) {
        UUID u = UUID.randomUUID();
        return Jwts.builder()
                .setId(gameCode + String.valueOf(u.getLeastSignificantBits()) + String.valueOf(u.getMostSignificantBits()))
                .setSubject("login")
                .compact();
    }
//    public synchronized boolean isInactive() {
//        long lastTime = System.currentTimeMillis();
//        if(this.lastInteraction == 0) {
//            this.lastInteraction = lastTime;
//        }
//        long difference = lastTime - this.lastInteraction;
//        return difference > TIMEOUT; // 50 seconds.
//    }

    public synchronized void updateLastInteraction() {
        this.lastInteraction = System.currentTimeMillis();
    }
    public synchronized void destroy() {
        gameUsers.remove(this.code);
    }
    public static GameUser fetchGameUser(String code) {
        GameUser found = gameUsers.get(code);
        if (found != null) {
            found.updateLastInteraction();
        }
        return found;
    }

    public int hashCode() {
        return this.code.hashCode();
    }

    public GameUserData toData() {
        GameUserData data = new GameUserData();

        data.setId(this.instanceId);
        data.setUsername(this.username);
        data.setScore(this.currentScore);
        data.setPreviousScore(this.previousScore);
        data.setDone(this.isDone);
        data.setGameMaster(this.isGameMaster);

        return data;
    }
}
