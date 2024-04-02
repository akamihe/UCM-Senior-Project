
import { useMemo, useEffect, useState } from 'react';
import { FaCircleCheck, FaCircleXmark } from "react-icons/fa6"
import GameSocket from '/app/services/GameSocket';
import DebugGame from './games/DebugGame';
import Battleship from './games/Battleship';
import HangMan from './games/HangMan';
import Sodoku from './games/Sudoku';
import TicTacToe from './games/TicTacToe';
import Pictionary from "./games/Pictionary";
import WaitingRoom from './games/WaitingRoom';
import AuthService from '/app/services/AuthService';

const style = {
  gameContainer: { flex: 1, padding: 16, display: 'flex', alignItems: "center" },
  playerInfoSection: { display: "flex", borderTop: "1px solid #0004", gap: 16, padding: 16 },
  playerInfoItem: {
    innerContainer: player => ({
      display: "flex", 
      alignItems: "center", 
      padding: 8, 
      borderRadius: 8, 
      backgroundColor: player.color + "11", 
      opacity: player.isDisconnected ? 0.5 : 1
    }),
    item: { position: "relative", flex: 1, border: "1px solid #0004", borderRadius: 8 },
    pts: color => ({ 
      border: "1px solid #0004", 
      padding: "4px 8px", 
      borderRadius: 16, 
      fontWeight: "bold", 
      fontSize: 14,
      borderColor: color,
      color,
      width: 45,
      textAlign: "center"
    }),
    icon: { color: "#0b0", position: "absolute", top: -8, right: -8, fontSize: 22, borderRadius: '50%' },
    disconnectedIcon: {
      position: "absolute", 
      top: -8, 
      right: -8,
      backgroundColor: "black", 
      color: "white", 
      padding: 3, 
      fontSize: 16,
      borderRadius: '50%' 
    },
    badge: color => ({
      position: "absolute", 
      top: -9, 
      left: "50%", 
      transform: "translate(-50%, 0)", 
      fontSize: 13, 
      color: "white", 
      backgroundColor: color, 
      padding: "0 8px", 
      fontWeight: "bold", 
      borderRadius: 5
    })
  },
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
    justifyContent: "center"
  }
}

const TIME_BETWEEN_GAMES = 10;
const placementColors = ["gold", "silver", "sienna"];

function GameHandler() {
  const [gameState, setGameState] = useState({});
  const [isGameSessionInProgress, setIsGameSessionInProgress] = useState(false);
  const [currentGame, setCurrentGame] = useState({ game: "", show: false });
  const [count, setCount] = useState(10);
  
  const isEliminationGame = currentGame.game === "Battleship";
  const sortedUsers = (gameState.users || []).slice().sort((a, b) => b.score - a.score);
  const socket = useMemo(() => GameSocket.getGameSocketInstance(), []);

  useEffect(() => {
    socket.onConnect = () => {
      socket.subscribe("/broker/start", () => setIsGameSessionInProgress(true));
      socket.subscribe("/broker/updateCount", data => setCount(data));
    }

    socket.onUpdateGameState = (gameState) => setGameState(gameState);
    socket.onServerDisconnect = () => AuthService.logout();
  }, [socket])

  useEffect(() => {
    if (isGameSessionInProgress)
      setCurrentGame({ game: gameState.games[gameState.gameNum], show: false });
  }, [gameState.gameNum, isGameSessionInProgress])

  useEffect(() => {
    if (isGameSessionInProgress && !currentGame.show)
      socket.startCountdown(TIME_BETWEEN_GAMES);
  }, [currentGame.show, isGameSessionInProgress])

  useEffect(() => {
    if (count === 0 && !currentGame.show)
      setCurrentGame(prev => ({ ...prev, show: true }));
  }, [count])

  useEffect(() => {
    console.log(gameState);
  }, [gameState])

  if (currentGame.show) {
    let gameToRender = null;

    switch (currentGame.game) {
      case 'DebugGame':
          gameToRender = <DebugGame socket={socket} gameState={gameState} />
          break;
      case 'HangMan':
          gameToRender = <HangMan socket={socket} gameState={gameState} />
          break;
      case 'Sudoku':
          gameToRender = <Sodoku socket={socket} gameState={gameState} />
          break;
      case 'TicTacToe':
          gameToRender = <TicTacToe socket={socket} gameState={gameState} />
          break;
      case 'Battleship':
          gameToRender = <Battleship socket={socket} gameState={gameState} />
          break;
      case "Pictionary":
          gameToRender = <Pictionary socket={socket} gameState={gameState} />
          break;
    }

    return (
      <div style={style.flexCenterContainer}>
        <div style={style.gameContainer}>{gameToRender}</div>
        <div style={style.playerInfoSection}>
          {gameState.users.map((user, idx) => (
            <div key={idx} style={style.playerInfoItem.item}>
              <div style={style.playerInfoItem.innerContainer(user)}>
                <span style={{ flex: 1, marginRight: 8 }}>{user.username}</span>
                <span style={style.playerInfoItem.pts(user.color)}>{user.score}</span>
              </div>
              {user.done && (
                isEliminationGame
                  ? <FaCircleXmark style={{ ...style.playerInfoItem.icon, color: "red" }} />
                  : <FaCircleCheck style={style.playerInfoItem.icon} />
              )}
              {user.isMe && <span style={style.playerInfoItem.badge(user.color)}>You</span>}
            </div>
          ))}
        </div>
      </div>
    )
  } else {
    if (isGameSessionInProgress) {
      if (gameState.gameNum === 0) {
        return (
          <div style={style.flexCenterContainer}>
            <p style={style.gameTitleText}>{gameState.games[gameState.gameNum]}</p>
            <p style={style.startsInText}>
              Starts in: <span style={{ fontWeight: "bold" }}>{count}</span>
            </p> 
          </div>
        )
      } else {
        return (
          <div style={style.gameResultsContainer}>
            <div style={{ width: 600 }}>
              {sortedUsers.map((player, idx) => {
                const placementColor = idx < 3 ? placementColors[idx] : "white";

                return (
                  <div key={idx} style={{ marginBottom: 16 }}>
                    <div style={style.gameResultsPlayer.top}>
                      <span style={style.gameResultsPlayer.placeNum(placementColor)}>{idx + 1}</span>
                      <span style={style.gameResultsPlayer.name}>{player.username}</span>
                      <div style={{ textAlign: "right", lineHeight: 1 }}>
                        <p style={style.gameResultsPlayer.prevPoints}>
                          {player.previousScore} pts
                        </p>
                        <p style={style.gameResultsPlayer.ptsAwarded}>
                          +{player.score - player.previousScore} pts
                        </p>
                      </div>
                    </div>
                    <p style={style.gameResultsPlayer.pts}>{player.score} pts</p>
                  </div>
                )
              })}
            </div>
            <div style={style.nextGameContainer}>
              <div>
                <p style={style.nextGameText}>NEXT GAME</p>
                <p style={style.gameTitleText}>{gameState.games[gameState.gameNum]}</p>
                <p style={style.startsInText}>
                  Starts in: <span style={{ fontWeight: "bold" }}>{count}</span>
                </p> 
              </div>
            </div>
          </div>
        )
      }
    } else if (gameState.users) {
      return <WaitingRoom socket={socket} gameState={gameState}/>;
    } else {
      return null;
    }
  }
}

export default GameHandler;