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
public class WebsocketAuthController extends AbstractGameBrokerController {

    private final AuthUserService GameUserService;
    @CrossOrigin
    @PostMapping("/gameuser/game/auth")
    public ResponseEntity<GameUser> joinGameNoAuth(@RequestBody GameCodeLogin code) {
        GameBroker game = GameBroker.fetchGame(code.getCode());

        if (game == null) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(game.newGameUser(code.getUsername()), HttpStatus.OK);
    }
    @CrossOrigin
    @PostMapping("/authuser/game/join")
    public ResponseEntity<GameUser> joinGameWithAuth(HttpServletRequest request, @RequestBody GameCodeLogin code) {
        //todo, setup better management of this, maybe use 404 HttpStatus.NOT_FOUND
        AuthUser user = GameUserService.find(LoginInterceptor.getUserId(request));
        System.out.println(code);
        if (user == null) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }

        GameBroker game = GameBroker.fetchGame(code.getCode());

        if (game == null) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(game.newGameUserFromAuthUser(user), HttpStatus.OK);
    }
}
