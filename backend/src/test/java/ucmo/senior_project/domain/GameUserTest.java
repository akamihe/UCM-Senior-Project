package ucmo.senior_project.domain;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Random;

import static org.junit.jupiter.api.Assertions.*;

class GameUserTest {
    AuthUser GameBrokerAuthUser;
    GameBroker broker;
    GameUser gameUser;
    GameUser brokerMaster;

    @BeforeEach
    void setupGameUser() {
        GameBrokerAuthUser = new AuthUser();
        GameBrokerAuthUser.setUserId(new Random().nextInt());
        broker = GameBroker.setupGame(GameBrokerAuthUser);
        brokerMaster = broker.getGameMaster();
        gameUser = broker.newGameUser("abc");
    }

    @Test
    void inactiveGameUserWillBeShownAsInactive() {
        gameUser.setLastInteraction(1); //set time to be basicaly 1970, they would be inactive for about 50 years in theory.
        assertTrue(gameUser.isInactive());
    }

    @Test
    void updateScore() {
        gameUser.setCurrentScore(50);
        gameUser.setPreviousScore(50);
        gameUser.updateScore(50);
        assertEquals(100, gameUser.getCurrentScore());
        assertEquals(50, gameUser.getPreviousScore());


        gameUser.updateScore(50);
        assertEquals(150, gameUser.getCurrentScore());
        assertEquals(100, gameUser.getPreviousScore());
    }

    @Test
    void updateLastInteraction() {
        long currentTime = System.currentTimeMillis();
        gameUser.updateLastInteraction();

        assertTrue(currentTime <= gameUser.getLastInteraction());
    }

    @Test
    void assertUsersDestroyCannotBeFetched() {
        assertNotNull(GameUser.fetchGameUser(gameUser.getCode()));

        gameUser.destroy();

        assertNull(GameUser.fetchGameUser(gameUser.getCode()));
    }
    @Test
    void setColor() {
        String expected = "ff00ff";
        gameUser.setColor(expected);

        assertEquals(expected, gameUser.getColor());
    }

    @Test
    void canFetchgameBrokerInstance() {
        assertNotNull(gameUser.getInstance());
    }

    @Test
    void sourceUserIsNullForRandomUsers() {
        assertNull(gameUser.getSourceUser());
    }

    @Test
    void sourceUserExistsForAuthUsers() {
        assertNotNull(brokerMaster.getSourceUser());
    }
    @Test
    void fetchedUsersUpdateInteraction() {
        long beforeNow = System.currentTimeMillis();
        GameUser.fetchGameUser(gameUser.getCode());
        assertTrue(beforeNow <= gameUser.getLastInteraction());
    }
}