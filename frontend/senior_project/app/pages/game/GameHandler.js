
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import GameSocket from '../../services/GameSocket';
import DebugGame from './types/DebugGame';
import GameWaitingRoom from './types/GameWaitingRoom';


function GameHandler() {
    const [socket] = useState(GameSocket.getGameSocketInstance());
    const [gameState, setGameState] = useState({});
    socket.bindGameInstanceUpdate(function(game) {
        setGameState(game);
    });
    if(!gameState.users) {
        return <div></div>
    }
    switch(gameState.gameType) {
        case 'DebugGame':
            return <DebugGame socket={socket} gameState={gameState} />
        default:
            return <GameWaitingRoom socket={socket} gameState={gameState}/>
    }
}

export default GameHandler;