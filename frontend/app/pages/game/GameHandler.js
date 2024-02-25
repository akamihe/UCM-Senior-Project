
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import GameSocket from '../../services/GameSocket';
import DebugGame from './types/DebugGame';
import Battleship from './types/Battleship';
import HangMan from './types/HangMan';
import Sodoku from './types/Sudoku';
import TicTacToe from './types/TicTacToe';
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