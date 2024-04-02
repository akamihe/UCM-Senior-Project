package ucmo.senior_project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ucmo.senior_project.domain.AuthUser;

import java.util.List;

@Repository
public interface AuthServiceRepository extends JpaRepository<AuthUser,Integer> {
    AuthUser findByUsername(String name);
    List<AuthUser> findByUserId(Integer userId);
}
