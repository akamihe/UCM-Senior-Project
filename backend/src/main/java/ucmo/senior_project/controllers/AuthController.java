package ucmo.senior_project.controllers;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ucmo.senior_project.domain.AuthUser;
import ucmo.senior_project.domain.GameBroker;
import ucmo.senior_project.domain.GameUser;
import ucmo.senior_project.middleware.LoginInterceptor;
import ucmo.senior_project.resource.auth.GameCodeLogin;
import ucmo.senior_project.service.AuthUserService;

import java.util.Arrays;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class AuthController {
    private final AuthUserService GameUserService;

    @PostMapping("/authuser/signup")
    public ResponseEntity<AuthUser> save(@RequestBody AuthUser GameUser) {
        System.out.println("userId " + GameUser.getUsername());
        System.out.println("userPassword " + GameUser.getPassword());

        AuthUser user = GameUserService.create(GameUser);

        if (user != null) {
            GameUserService.checkLogin(user.getUsername(), user.getPassword());
            return new ResponseEntity<>(user, HttpStatus.CREATED);
        }

        return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
    }

    @PostMapping("/authuser/login")
    public ResponseEntity<AuthUser> login(@RequestBody AuthUser GameUser) {
        //todo, setup better management of this, maybe use 404 HttpStatus.NOT_FOUND
        AuthUser user = GameUserService.checkLogin(GameUser.getUsername(), GameUser.getPassword());
        if (user == null) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @PostMapping("/authuser/game/hostGame")
    public ResponseEntity<GameUser> createGame(HttpServletRequest request) {
        //todo, setup better management of this, maybe use 404 HttpStatus.NOT_FOUND
        AuthUser user = GameUserService.find(LoginInterceptor.getUserId(request));
        if (user == null) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
        GameBroker game = GameBroker.setupGame(user);
        return new ResponseEntity<>(game.getUsers().get(0), HttpStatus.OK);
    }

    @PostMapping("/debug/authcheck")
    public ResponseEntity<AuthUser> debug(HttpServletRequest request) {
        int id = LoginInterceptor.getUserId(request);
        String token = request.getHeader("token");
        return new ResponseEntity<>(GameUserService.debugCheckAuth(id, token), HttpStatus.OK);
    }

    @PostMapping("/gameuser/game/joinGame")
    public ResponseEntity<Object> joinGame(@RequestBody GameCodeLogin code) {
        GameBroker game = GameBroker.fetchGame(code.getCode());

        if (game == null)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Game not found.");
        else if (game.getUsers().size() == GameBroker.MAX_NUM_PLAYERS)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Game is full.");

        return new ResponseEntity<>(game.addUser(code.getUsername()), HttpStatus.OK);
    }
}