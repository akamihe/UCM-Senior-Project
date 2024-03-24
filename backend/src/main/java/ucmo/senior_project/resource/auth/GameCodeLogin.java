package ucmo.senior_project.resource.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GameCodeLogin
{
    private String code, username;
}
