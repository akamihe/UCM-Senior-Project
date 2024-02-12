package ucmo.senior_project.persistent;

import java.util.HashMap;

public class SuperGame {
    double test = Math.random();
    public static HashMap<String, SuperGame> activeGames = new HashMap<>();

    public double getDebugValue() {
        return test;
    }

    public static SuperGame fetchOrCreateGame(String code) {
        if(activeGames.containsKey(code)) {
            return activeGames.get(code);
        }
        SuperGame g = new SuperGame();
        activeGames.put(code, g);
        return g;
    }
}
