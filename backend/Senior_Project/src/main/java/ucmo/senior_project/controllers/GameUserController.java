package ucmo.senior_project.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import ucmo.senior_project.domain.GameUser;
import ucmo.senior_project.domain.SuperGame;
import ucmo.senior_project.domain.TempUser;
import ucmo.senior_project.resource.GameCodeLogin;
import ucmo.senior_project.resource.SuperGameData;
import ucmo.senior_project.service.GameUserService;
import ucmo.senior_project.middleware.LoginInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin
@RequestMapping
@RequiredArgsConstructor
public class GameUserController {

	private final GameUserService GameUserService;

	@CrossOrigin
	@PostMapping("/gameuser/join")
	public ResponseEntity<GameUser> save(@RequestBody GameUser GameUser) {
		System.out.println("userId " + GameUser.getUsername());
		System.out.println("userPassword " + GameUser.getPassword());

		GameUser user = GameUserService.create(GameUser);

		if (user != null) {
			GameUserService.checkLogin(user.getUsername(), user.getPassword());
			return new ResponseEntity<>(user, HttpStatus.CREATED);
		}

		return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
	}

	@CrossOrigin
	@PostMapping("/gameuser/login")
	public ResponseEntity<GameUser> login(@RequestBody GameUser GameUser) {
		//todo, setup better management of this, maybe use 404 HttpStatus.NOT_FOUND
		GameUser user = GameUserService.checkLogin(GameUser.getUsername(), GameUser.getPassword());
		if (user == null) {
			return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
		}
		return new ResponseEntity<>(user, HttpStatus.OK);
	}

	@CrossOrigin
	@PostMapping("/gameuser/game/create")
	public ResponseEntity<TempUser> createGame(HttpServletRequest request) {
		//todo, setup better management of this, maybe use 404 HttpStatus.NOT_FOUND
		GameUser user = GameUserService.find(LoginInterceptor.getUserId(request));
		if (user == null) {
			return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
		}
		SuperGame game = SuperGame.setupGame(user);
		return new ResponseEntity<>(game.getGameMaster(), HttpStatus.OK);
	}
	@CrossOrigin
	@PostMapping("/gameuser/game/auth")
	public ResponseEntity<TempUser> createTempUser(@RequestBody GameCodeLogin code) {
		//todo, setup better management of this, maybe use 404 HttpStatus.NOT_FOUND
		SuperGame game = SuperGame.fetchGame(code.getCode());

		return new ResponseEntity<>(game.newTempUser(code.getUsername()), HttpStatus.OK);
	}
	@CrossOrigin
	@PostMapping("/debug/authcheck")
	public ResponseEntity<GameUser> debug(HttpServletRequest request) {
		int id = LoginInterceptor.getUserId(request);
		String token = request.getHeader("token");
		return new ResponseEntity<>(GameUserService.debugCheckAuth(id, token), HttpStatus.OK);
	}
	@MessageMapping("/game/instance/{code}")
	@SendTo("/game/instance/{code}")
	public SuperGameData handleGame(@DestinationVariable String code, @RequestBody JsonNode payload) throws Exception {
		TempUser user = TempUser.fetchTempUser(code);
		SuperGame game = user.getInstance();
		game.updateInput(user, payload);
		return new SuperGameData(game);
	}
}
