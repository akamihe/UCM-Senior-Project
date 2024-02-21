
import AuthService from '../../../services/AuthService';


function GameWaitingRoom(data) {
    var _socket = data.socket;
    var gameState = data.gameState;
    function handleSubmit(e) {
        e.preventDefault();
        _socket.sendMessageToServer({admin:{'state':'start'}})
    }
    // todo, is game master if(AuthService)
    return <form onSubmit={handleSubmit}>
            <div>
                GameCode: {gameState.code}
                <hr/>
                users that have joined!
                {gameState.users.map(function(user, i){
                    return <div key={i}>{user.username}</div>
                })}
            </div>
            <hr/>
            <button type="submit">Begin</button>
        </form>
}

export default GameWaitingRoom;