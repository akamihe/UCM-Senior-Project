package ucmo.senior_project.controllers;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import ucmo.senior_project.domain.AuthUser;
import ucmo.senior_project.service.AuthUserService;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class AuthControllerTest {
    AuthUser user;

    @Autowired
    AuthUserService GameUserService;

    @Autowired
    AuthController controller;

    MockHttpServletRequest mockedRequest;

    @BeforeEach
    void setupBasicUser() {
        user = new AuthUser();
        user.setUsername("bob");
        user.setPassword("password");
        user.setAwt_token("debug");
        user = GameUserService.create(user);
        mockedRequest = new MockHttpServletRequest();
        mockedRequest.addHeader("token", user.getAwt_token());
        mockedRequest.addHeader("userId", user.getUserId());
    }
    @AfterEach
    void clearDatabase() {
        GameUserService.destroy(user);
    }

    @Test
    void canCreateNewUser() {
        AuthUser newUser = new AuthUser();
        newUser.setUsername("Not Bob");
        newUser.setPassword("not password");
        assertNotNull(controller.save(newUser).getBody());
    }
    @Test
    void cannotCreateUseWithDupUsername() {
        AuthUser newUser = new AuthUser();
        newUser.setUsername("bob");
        newUser.setPassword("not password");
        controller.save(newUser);
        assertNull(controller.save(newUser).getBody());
    }

    @Test
    void loginWithValid() {
        assertNotNull(controller.login(user).getBody());
    }

    @Test
    void loginFailsWithInvalidInfo() {
        AuthUser randoUser = new AuthUser();
        randoUser.setUsername("not bob");
        randoUser.setPassword("not password");
        assertNull(controller.login(randoUser).getBody());
    }

    @Test
    void loginFailsWithInvalidPassword() {
        AuthUser randoUser = new AuthUser();
        randoUser.setUsername("bob");
        randoUser.setPassword("not password");
        assertNull(controller.login(randoUser).getBody());
    }


    @Test
    void createGame() {
        controller.createGame(mockedRequest);
    }
}