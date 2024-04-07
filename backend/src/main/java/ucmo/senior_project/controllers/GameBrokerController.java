package ucmo.senior_project.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import ucmo.senior_project.controllers.AbstractGameBrokerController;
import ucmo.senior_project.domain.GameBroker;
import ucmo.senior_project.domain.GameUser;
import ucmo.senior_project.resource.game.GameBrokerData;
import ucmo.senior_project.resource.auth.UserDataInterface;
import ucmo.senior_project.resource.auth.UserDisconnected;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ucmo.senior_project.resource.input.ActiveGames;

@RestController
@CrossOrigin
@RequestMapping
@RequiredArgsConstructor
public class GameBrokerController extends AbstractGameBrokerController {

	@MessageMapping("/broker/wake/{code}")
	@SendTo("/broker/wake/{code}")
	public UserDataInterface wake(@DestinationVariable String code, @RequestBody JsonNode payload) throws Exception {
		if (!this.activateUser(code)) {
			return new UserDisconnected();
		}
		this.gameBroker.wake(this.user);
		return new GameBrokerData(this.gameBroker, user);
	}

	@MessageMapping("/broker/start/{code}")
	public void begin(@DestinationVariable String code, ActiveGames games) throws Exception {
		if (this.activateUser(code) && this.user == gameBroker.getGameMaster()) {
			this.gameBroker.beginGame(games);
		}
	}

	@MessageMapping("/broker/setProfileColor/{code}")
	public void setProfileColor(@DestinationVariable String code, @RequestBody JsonNode payload) throws Exception {
		if(this.activateUser(code)) {
			this.user.setColor(payload.get("color").asText());
		}
	}
}
