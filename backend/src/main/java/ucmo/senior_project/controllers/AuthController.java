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

@RestController
@CrossOrigin
@RequestMapping
@RequiredArgsConstructor
public class AuthController {

    private final AuthUserService GameUserService;

    @CrossOrigin
    @PostMapping("/authuser/join")
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

    @CrossOrigin
    @PostMapping("/authuser/login")
    public ResponseEntity<AuthUser> login(@RequestBody AuthUser GameUser) {
        //todo, setup better management of this, maybe use 404 HttpStatus.NOT_FOUND
        AuthUser user = GameUserService.checkLogin(GameUser.getUsername(), GameUser.getPassword());
        if (user == null) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @CrossOrigin
    @PostMapping("/authuser/game/create")
    public ResponseEntity<GameUser> createGame(HttpServletRequest request) {
        //todo, setup better management of this, maybe use 404 HttpStatus.NOT_FOUND
        AuthUser user = GameUserService.find(LoginInterceptor.getUserId(request));
        if (user == null) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
        GameBroker game = GameBroker.setupGame(user);
        return new ResponseEntity<>(game.getGameMaster(), HttpStatus.OK);
    }
    @CrossOrigin
    @PostMapping("/debug/authcheck")
    public ResponseEntity<AuthUser> debug(HttpServletRequest request) {
        int id = LoginInterceptor.getUserId(request);
        String token = request.getHeader("token");
        return new ResponseEntity<>(GameUserService.debugCheckAuth(id, token), HttpStatus.OK);
    }
}
