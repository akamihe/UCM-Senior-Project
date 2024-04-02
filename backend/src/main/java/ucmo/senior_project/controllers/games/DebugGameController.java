package ucmo.senior_project.controllers.games;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin
@RequestMapping
@RequiredArgsConstructor
public class DebugGameController {
//
//    @MessageMapping("/game/debug/input/{code}")
//    @SendTo("/game/debug/listen/{code}")
//    public DebugGameData handleUserInput(@DestinationVariable String code, JsonNode data) {
//        if(this.activateUser(code)) {
//            DebugGame debugGame = this.getCurrentGame(DebugGame.class);
//            if(debugGame != null) {
//                debugGame.updateInput(this.user, data);
//                return debugGame.getGameData(this.user);
//            }
//        }
//        Map<String, String> map = Collections.emptyMap();
//        return new DebugGameData(map);
//    }
//    @MessageMapping("/game/debug/listen/{code}")
//    @SendTo("/game/debug/listen/{code}")
//    public DebugGameData handleWakeCall(@DestinationVariable String code, JsonNode data) {
//        if(this.activateUser(code)) {
//            DebugGame debugGame = this.getCurrentGame(DebugGame.class);
//            if(debugGame != null) {
//                return debugGame.getGameData(this.user);
//            }
//        }
//        Map<String, String> map = Collections.emptyMap();
//        return new DebugGameData(map);
//    }
}
