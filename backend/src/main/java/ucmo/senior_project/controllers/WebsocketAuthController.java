package ucmo.senior_project.controllers;


import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ucmo.senior_project.domain.GameBroker;
import ucmo.senior_project.domain.GameUser;
import ucmo.senior_project.resource.auth.GameCodeLogin;

@RestController
@CrossOrigin
@RequestMapping
@RequiredArgsConstructor
public class WebsocketAuthController extends AbstractGameBrokerController {

    @CrossOrigin
    @PostMapping("/gameuser/game/auth")
    public ResponseEntity<GameUser> createameUser(@RequestBody GameCodeLogin code) {
        GameBroker game = GameBroker.fetchGame(code.getCode());

        return new ResponseEntity<>(game.newgameUser(code.getUsername()), HttpStatus.OK);
    }
}
