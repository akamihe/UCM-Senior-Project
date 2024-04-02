package ucmo.senior_project.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import ucmo.senior_project.domain.GameBroker;
import ucmo.senior_project.domain.data.GameBrokerData;
import ucmo.senior_project.domain.GameUser;
import lombok.RequiredArgsConstructor;

import java.util.TimerTask;

@Controller
@RequiredArgsConstructor
public class GameBrokerController {
	@Autowired
	private SimpMessagingTemplate messagingTemplate;

	@MessageMapping("/broker/getGameState/{code}")
	@SendTo("/broker/updateGameState/{code}")
	public GameBrokerData getGameState(@DestinationVariable String code) throws Exception {
		GameBroker game = GameBroker.fetchGame(code);
		return game.toData();
	}

	@MessageMapping("/broker/getUser/{userCode}")
	@SendTo("/broker/getUser/{userCode}")
	public GameUser getUser(@DestinationVariable String userCode) throws Exception {
		return GameUser.fetchGameUser(userCode);
	}

	@MessageMapping("/broker/start/{code}")
	@SendTo("/broker/start/{code}")
	public String start(@DestinationVariable String code) throws Exception {
		GameBroker game = GameBroker.fetchGame(code);
		if (game != null) game.resetGameData();
		return "";
	}

	@MessageMapping("/broker/startCountdown/{code}")
	public void startCountdown(@DestinationVariable String code, int count) throws Exception {
		GameBroker game = GameBroker.fetchGame(code);
		countDown(game, count);
	}

	public void countDown(GameBroker game, int count) {
		messagingTemplate.convertAndSend("/broker/updateCount/" + game.getCode(), count);

		if (count > 0) {
			game.schedule(new TimerTask() {
				@Override
				public void run() {
					countDown(game, count - 1);
				}
			}, 1);
		}
	}

	@MessageMapping("/broker/startTimer/{code}")
	public void startTimer(@DestinationVariable String code, long duration) throws Exception {
		GameBroker game = GameBroker.fetchGame(code);
		game.schedule(new TimerTask() {
			@Override
			public void run() {
				messagingTemplate.convertAndSend("/broker/timerEnded/" + code, "");
			}
		}, duration);
	}

	@MessageMapping("/broker/cancelTimer/{code}")
	public void cancelTimer(@DestinationVariable String code) throws Exception {
		GameBroker game = GameBroker.fetchGame(code);
		game.cancelTimer();
	}

	@MessageMapping("/broker/endGame/{code}")
	@SendTo("/broker/updateGameState/{code}")
	public GameBrokerData endGame(@DestinationVariable String code) {
		GameBroker game = GameBroker.fetchGame(code);
		game.setGameNum(game.getGameNum() + 1);

		for (GameUser user : game.getUsers())
			user.setDone(false);

		return game.toData();
	}
}
