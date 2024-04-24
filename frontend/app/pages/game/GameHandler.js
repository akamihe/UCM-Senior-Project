
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import GameSocket from '/app/services/GameSocket';
import DebugGame from './types/DebugGame';
import Battleship from './types/Battleship';
import HangMan from './types/HangMan';
import Sodoku from './types/Sudoku';
import Pictionary from './types/Pictionary'
import TicTacToe from './types/TicTacToe';
import GameWaitingRoom from './types/GameWaitingRoom';
import AuthService from '/app/services/AuthService';

function gameFinished(gameState, isDone) {
    const style = {
        gameContainer: { flex: 1, padding: 16, display: 'flex', alignItems: "center" },
        playerInfoSection: { display: "flex", borderTop: "1px solid #0004", gap: 16, padding: 16 },
        gameTitleText: { textAlign: "center", fontSize: 32, fontWeight: "bold", marginBottom: 16 },
        startsInText: { textAlign: "center", color: "#0008", fontSize: 18 },
        gameResultsContainer: { 
          justifyContent: "center", 
          alignItems: "center" ,
          display: "flex", 
          flexDirection: "column", 
          height: "100%"
        },
        gameResultsPlayer: {
          top: { display: "flex", alignItems: "center", borderBottom: "1px solid #0003", paddingBottom: 8 },
          placeNum: (color) => ({ 
            width: 27, 
            fontSize: 18, 
            margin: "2px 12px 0 0", 
            backgroundColor: color,
            color: "#0009",
            border: "1px solid #0007",
            borderRadius: "50%", 
            fontWeight: "bold", 
            textAlign: "center" 
          }),
          name: { fontSize: 24, flex: 1 },
          prevPoints: { color: "#0006", fontSize: 14 },
          ptsAwarded: { color: "#0b0", fontSize: 14, fontWeight: "bold" },
          pts: { fontSize: 24, fontWeight: "bold", textAlign: "right" }
        },
        nextGameContainer: { marginTop: 64, textAlign: "center", lineHeight: 1.25 },
        nextGameText: { fontSize: 14, color: "#0007" },
        flexCenterContainer: {
          width: "100%", 
          height: "100%", 
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "center", 
          alignItems: "center"
        }
      }
      const placementColors = ["gold", "silver", "sienna"];
    return <div style={style.gameResultsContainer}>
        <div style={{ width: 600 }}>
        {gameState.users.map((player, idx) => {
            const placementColor = player.color;

            return (
            <div key={idx} style={{ marginBottom: 16 }}>
                <div style={style.gameResultsPlayer.top}>
                <span style={style.gameResultsPlayer.placeNum(placementColor)}>{idx + 1}</span>
                <span style={style.gameResultsPlayer.name}>{player.username}</span>
                <div style={{ textAlign: "right", lineHeight: 1 }}>
                    <p style={style.gameResultsPlayer.prevPoints}>{player.previousScore} pts</p>
                    <p style={style.gameResultsPlayer.ptsAwarded}>+{player.score - player.previousScore} pts</p>
                </div>
                </div>
                <p style={style.gameResultsPlayer.pts}>{player.score} pts</p>
            </div>
            )
        })}
        </div>
        <div style={style.nextGameContainer}>
            {!isDone && <div>
                    <p style={style.nextGameText}>NEXT GAME</p>
                    <p style={style.gameTitleText}>{gameState.nextGameName}</p>
                    <p style={style.startsInText}>
                        Starts in: <span style={{ fontWeight: "bold" }}>{gameState.secondsUntilNextGame}</span>
                    </p> 
                </div>
            }
        </div>
    </div>
}

function GameHandlerProxied() {
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
    if(gameState.betweenGames) {
       return gameFinished(gameState, false)
    }
    else if(gameState.gameFinished) {
        return gameFinished(gameState, true)
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
        case 'Pictionary':
            return <Pictionary socket={socket} gameState={gameState} />
        default:
            return <GameWaitingRoom socket={socket} gameState={gameState}/>
    }
}
function GameHandler() {
    return <div style={{ paddingTop: "60px" }}>
        {GameHandlerProxied()}
    </div>
}

export default GameHandler;