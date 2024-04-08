package ucmo.senior_project.controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import ucmo.senior_project.domain.AuthUser;
import ucmo.senior_project.domain.GameBroker;
import ucmo.senior_project.domain.GameUser;
import ucmo.senior_project.resource.auth.GameCodeLogin;
import ucmo.senior_project.service.AuthUserService;

import java.util.Random;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertNull;

@SpringBootTest
class WebsocketAuthControllerTest {

    AuthUser GameBrokerAuthUser;
    GameBroker broker;
    GameUser gameUser;
    GameUser brokerMaster;
    AuthUser user;

    @Autowired
    AuthUserService GameUserService;

    @Autowired
    WebsocketAuthController controller;

    @BeforeEach
    void setupGameUser() {
        GameBrokerAuthUser = new AuthUser();
        GameBrokerAuthUser.setUserId(new Random().nextInt());
        broker = GameBroker.setupGame(GameBrokerAuthUser);
        brokerMaster = broker.getGameMaster();
    }
    @Test
    void joinGameNoAuthSuccessful() {
        assertNotNull(controller.joinGameNoAuth(new GameCodeLogin(broker.getCode(), "Bob")).getBody());
    }

    @Test
    void joinGameWithAutSuccessful() {
        assertNull(controller.joinGameNoAuth(new GameCodeLogin("invalid", "Bob")).getBody());
    }


    @Test
    void joinGameNoAuthWrongCode() {

        user = new AuthUser();
        user.setUsername("bob dragon 44");
        user.setPassword("password");
        user.setAwt_token("debug");
        user = GameUserService.create(user);
        MockHttpServletRequest mockedRequest = new MockHttpServletRequest();
        mockedRequest.addHeader("token", user.getAwt_token());
        mockedRequest.addHeader("userId", user.getUserId());
        assertNotNull(controller.joinGameWithAuth(mockedRequest, new GameCodeLogin(broker.getCode(), "")).getBody());
    }

    @Test
    void joinGameWithAutWrongCode() {

        user = new AuthUser();
        user.setUsername("bob tree 44");
        user.setPassword("password");
        user.setAwt_token("debug");
        user = GameUserService.create(user);
        MockHttpServletRequest mockedRequest = new MockHttpServletRequest();
        mockedRequest.addHeader("token", user.getAwt_token());
        mockedRequest.addHeader("userId", user.getUserId());
        assertNull(controller.joinGameWithAuth(mockedRequest, new GameCodeLogin("incorrect code", "")).getBody());
    }
}