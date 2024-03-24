
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import GameSocket from '/app/services/GameSocket';
import DebugGame from './types/DebugGame';
import Battleship from './types/Battleship';
import HangMan from './types/HangMan';
import Sodoku from './types/Sudoku';
import TicTacToe from './types/TicTacToe';
import GameWaitingRoom from './types/GameWaitingRoom';
import AuthService from '/app/services/AuthService';


function GameHandler() {
    const [socket] = useState(GameSocket.getGameSocketInstance());
    const [gameState, setGameState] = useState({});
    const hasLoaded = useRef(false);
    if(hasLoaded.current == false) {
        socket.bindGameInstanceUpdate(function(game) {
            setGameState(game);
        });
        socket.setOnDisconnect(function() {
            AuthService.logout()
        });
        hasLoaded.current = true;
    }
    if(!gameState.users) {
        return <div></div>
    }
    switch(gameState.gameType) {
        case 'DebugGame':
            return <DebugGame socket={socket} gameState={gameState} />
        case 'HangMan':
            return <HangMan socket={socket} gameState={gameState} />
        case 'Sudoku':
            return <Sodoku socket={socket} gameState={gameState} />
        case 'TicTacToe':
            return <TicTacToe socket={socket} gameState={gameState} />
        case 'Battleship':
            return <Battleship socket={socket} gameState={gameState} />
        default:
            return <GameWaitingRoom socket={socket} gameState={gameState}/>
    }
}

export default GameHandler;