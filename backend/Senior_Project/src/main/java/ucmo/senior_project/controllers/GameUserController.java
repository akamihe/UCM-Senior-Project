package ucmo.senior_project.controllers;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.util.HtmlUtils;
import ucmo.senior_project.domain.GameUser;
import ucmo.senior_project.persistent.SuperGame;
import ucmo.senior_project.resource.GameDebugObject;
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
	@PostMapping("/debug/authcheck")
	public ResponseEntity<GameUser> debug(HttpServletRequest request) {
		int id = LoginInterceptor.getUserId(request);
		String token = request.getHeader("token");
		return new ResponseEntity<>(GameUserService.debugCheckAuth(id, token), HttpStatus.OK);
	}
	@MessageMapping("/debug/game")
	@SendTo("/debug/recieve")
	public GameDebugObject debug(GameDebugObject message) throws Exception {
		System.out.println(message.getCode() + " _ " +  message.getValue());
		Thread.sleep(1000); // simulated delay
		return new GameDebugObject(message.getCode(), SuperGame.fetchOrCreateGame(message.getCode()).getDebugValue());
	}
}
