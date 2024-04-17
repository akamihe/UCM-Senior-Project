package ucmo.senior_project.domain.gametypes;

import com.fasterxml.jackson.databind.JsonNode;
import ucmo.senior_project.domain.Game;
import ucmo.senior_project.domain.GameUser;
import ucmo.senior_project.resource.game.types.DotsAndBoxesData;

import java.util.HashMap;
import java.util.List;

public class DotsAndBoxes implements Game {

    private HashMap<Integer, DotsAndBoxesData> gameStates = new HashMap<Integer, DotsAndBoxesData>();
    private DotsAndBoxesData gameData;

    @Override
    public DotsAndBoxesData getGameData(GameUser user) {
        return this.gameStates.getOrDefault(user.getSourceUser(), new DotsAndBoxesData(8));
    }

    @Override
    public void updateInput(GameUser user, JsonNode data) {
        int i = data.get("i").asInt();
        int j = data.get("j").asInt();
        int k = data.get("k").asInt();
        int playerId = user.getSourceUser();
        DotsAndBoxesData gameData = gameStates.get(playerId);
        gameData.drawLine(i, j, k, user);
        this.gameData = gameData; // Update gameData
    }

    @Override
    public boolean updateSystem() {
        if (this.gameData == null) {
            System.out.println("Game data is null in updateSystem. This should not happen.");
            return false;
        }
        this.gameData.checkGameOver();
        return this.gameData.getWinMessage().isEmpty();
    }

    @Override
    public void init(List<GameUser> users) {
        this.gameData = new DotsAndBoxesData(8);
        users.forEach(user -> gameStates.put(user.getSourceUser(), this.gameData));
    }

    @Override
    public void finish(List<GameUser> users) {
    }
}
