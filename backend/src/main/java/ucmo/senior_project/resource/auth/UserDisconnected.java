package ucmo.senior_project.resource.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDisconnected  implements UserDataInterface {
    private String disconnected = "user has been timed out";
}
