package ucmo.senior_project.service;

import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ucmo.senior_project.domain.GameUser;
import ucmo.senior_project.repository.GameUserRepository;



@Service
@RequiredArgsConstructor
public class GameUserService {

    private final GameUserRepository GameUserRepository;

    @Transactional
    public GameUser create(GameUser GameUser){
        GameUser other = this.getUserByUsername(GameUser.getUsername());

        if (other != null) {
            if(other.getUserId() == GameUser.getUserId()) {
                return GameUserRepository.save(GameUser);
            } else {
                return null;
            }
        }
        //TODO heighten security with encryption
        return GameUserRepository.save(GameUser);
    }
    public GameUser find(int user_id) {
        return GameUserRepository.findById(user_id).orElseThrow();
    }

    @Transactional
    public GameUser getUserByUsername(String name){
        return GameUserRepository.findByUsername(name);
    }

    public GameUser checkLogin(String username, String password) {
        //TODO heighten security with encryption
        GameUser user = this.getUserByUsername(username);

        if (user != null && user.getPassword().equals(password)) {
            String token = Jwts.builder()
                    .setId(""+user.getUserId())
                    .setSubject("login")
                    .compact();

            user.setAwt_token(token);
            GameUserRepository.save(user);
            return user;
        }

        return null;
    }
    public boolean checkAuth(int id, String token) {
        GameUser user = this.GameUserRepository.findById(id).get();
        return (user != null && user.getAwt_token().equals(token));
    }
    public GameUser debugCheckAuth(int id, String token) {
        GameUser user = this.GameUserRepository.findById(id).get();
        return user;
    }
}
