package ucmo.senior_project.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.jsonwebtoken.Jwts;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Data
@RequiredArgsConstructor
public class TempUser {
    public static long TIMEOUT = 50000; //50 seconds
    private static Map<String, TempUser> tempUsers = Collections.synchronizedMap(new HashMap<>());
    public static int CURRENT_COUNT = 0;
    @JsonIgnore
    private SuperGame instance;
    private int instanceId = CURRENT_COUNT++;
    private Integer sourceUser = null;
    private String username;
    private String code;
    private String gameCode;
    public long lastInteraction = 0;

    public TempUser(SuperGame instance, String username, String gameCode) {
        this.instance = instance;
        this.username = username;
        this.gameCode = gameCode;
        this.code = createCode(instance.getCode());
        tempUsers.put(this.code, this);
    }
    public TempUser(SuperGame instance, GameUser user, String gameCode) {
        this.instance = instance;
        this.sourceUser = user.getUserId();
        this.username = user.getUsername();
        this.gameCode = gameCode;
        this.code = createCode(instance.getCode());
        tempUsers.put(this.code, this);
    }
    public static String createCode(String gameCode) {
        UUID u = UUID.randomUUID();
        return Jwts.builder()
                .setId(gameCode + String.valueOf(u.getLeastSignificantBits()) + String.valueOf(u.getMostSignificantBits()))
                .setSubject("login")
                .compact();
    }
    public synchronized boolean isInactive() {
        long lastTime = System.currentTimeMillis();
        if(this.lastInteraction == 0) {
            this.lastInteraction = lastTime;
        }
        long difference = lastTime - this.lastInteraction;
        return difference > TIMEOUT; // 50 seconds.
    }
    public synchronized void updateLastInteraction() {
        this.lastInteraction = System.currentTimeMillis();
    }
    public synchronized void destroy() {
        tempUsers.remove(this.code);
    }
    public static TempUser fetchTempUser(String code) {
        TempUser found = tempUsers.get(code);
        if (found != null) {
            found.updateLastInteraction();
        }
        return found;
    }

    public int hashCode() {
        return this.code.hashCode();
    }
}
