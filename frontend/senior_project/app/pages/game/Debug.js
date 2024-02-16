
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import GameSocket from '../../services/GameSocket';


function Debug() {
    const [socket] = useState(GameSocket.getGameSocketInstance());
    const [gameState, setGameState] = useState({});
    socket.bindGameInstanceUpdate(function(game) {
        setGameState(game);
    });
    if(!gameState.users) {
        return <div></div>
    }
      return (
        <div>
            <Form>
                {gameState.code}
                {gameState.users.map(function(user, i){
                    return <div key="{i}">{user.username}</div>
                })}
            </Form>
        </div>
    );
}

export default Debug;