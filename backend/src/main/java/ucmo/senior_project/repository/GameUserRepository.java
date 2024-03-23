package ucmo.senior_project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ucmo.senior_project.domain.GameUser;

import java.util.List;

@Repository
public interface GameUserRepository extends JpaRepository<GameUser,Integer> {
    GameUser findByUsername(String name);
    List<GameUser> findByUserId(Integer userId);
}
