package ucmo.senior_project.resource;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GameCodeLogin
{
    private String code, username;
}
