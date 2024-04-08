package ucmo.senior_project.service;

import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ucmo.senior_project.domain.AuthUser;
import ucmo.senior_project.repository.AuthServiceRepository;



@Service
@RequiredArgsConstructor
public class AuthUserService {

    private final AuthServiceRepository GameUserRepository;

    @Transactional
    public AuthUser create(AuthUser GameUser){
        AuthUser other = this.getUserByUsername(GameUser.getUsername());

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
    public AuthUser find(int user_id) {
        return GameUserRepository.findById(user_id).orElseThrow();
    }

    @Transactional
    public AuthUser getUserByUsername(String name){
        return GameUserRepository.findByUsername(name);
    }

    public AuthUser checkLogin(String username, String password) {
        //TODO heighten security with encryption
        AuthUser user = this.getUserByUsername(username);

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
        AuthUser user = this.GameUserRepository.findById(id).get();
        return (user != null && user.getAwt_token().equals(token));
    }
    public AuthUser debugCheckAuth(int id, String token) {
        AuthUser user = this.GameUserRepository.findById(id).get();
        return user;
    }
    public void destroy(AuthUser user) {
        this.GameUserRepository.delete(user);
    }
}
