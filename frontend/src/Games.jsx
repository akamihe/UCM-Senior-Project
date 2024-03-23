import { useState, useEffect } from "react";
import { FaCircleCheck, FaCircleXmark } from "react-icons/fa6"
import { AiOutlineDisconnect } from "react-icons/ai";
import Sudoku from "./Sudoku"
import Battleship from "./Battleship"
import socketClient from "./socketClient"
import Pictionary from "./Pictionary";

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
      color
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
    justifyContent: "center", 
    alignItems: "center"
  }
}

const games = ["Sudoku", "Battleship", "Pictionary"];
const placementColors = ["gold", "silver", "sienna"];
const COUNTDOWN_DURATION = 10;

export default function Games({ connected, players }) {
  const [count, setCount] = useState(COUNTDOWN_DURATION);
  const [gameNum, setGameNum] = useState(-1);
  const [isGameActive, setIsGameActive] = useState(false);

  const playersSortedByPts = players.slice().sort((a, b) => (b.pts + b.ptsAwarded) - (a.pts + a.ptsAwarded));
  const isEliminationGame = games[gameNum] === "Battleship";

  useEffect(() => {
    if (connected) {
      socketClient.subscribe("/topic/updateCount", message => {
        setCount(JSON.parse(message.body));
      });
      socketClient.subscribe("/topic/endGame", () => setIsGameActive(false));
    }
  }, [connected])

  useEffect(() => {
    if (connected && !isGameActive)
      socketClient.publish({ destination: "/app/startCountdown", body: COUNTDOWN_DURATION });
  }, [connected, isGameActive])

  useEffect(() => {
    if (count === 0) { // When count hits zero, start the next game
      setGameNum(prev => prev + 1);
      setIsGameActive(true);
    }
  }, [count])

  if (isGameActive) {
    return (
      <>
        <div style={style.gameContainer}>
          {gameNum >= 0 && <Game connected={connected} players={players} game={games[gameNum]} />}
        </div>
        <div style={style.playerInfoSection}>
          {players.map((player, idx) => (
            <div key={idx} style={style.playerInfoItem.item}>
              <div style={style.playerInfoItem.innerContainer(player)}>
                <span style={{ flex: 1, marginRight: 8 }}>{player.name}</span>
                <span style={style.playerInfoItem.pts(player.color)}>{player.pts + player.ptsAwarded} pts</span>
              </div>
              {player.isDisconnected ? (
                <AiOutlineDisconnect style={style.playerInfoItem.disconnectedIcon} />
              ) : player.done && (
                isEliminationGame
                  ? <FaCircleXmark style={{ ...style.playerInfoItem.icon, color: "red" }} />
                  : <FaCircleCheck style={style.playerInfoItem.icon} />
              )}
              {player.isMe && <span style={style.playerInfoItem.badge(player.color)}>You</span>}
            </div>
          ))}
        </div>
      </>
    );
  } else {
    if (gameNum < 0) {
      return (
        <div style={style.flexCenterContainer}>
          <p style={style.gameTitleText}>{games[gameNum + 1]}</p>
          <p style={style.startsInText}>
            Game starts in: <span style={{ fontWeight: "bold" }}>{count}</span>
          </p>
        </div>
      );
    } else {
      return (
        <div style={style.gameResultsContainer}>
          <div style={{ width: 600 }}>
            {playersSortedByPts.map((player, idx) => {
              const placementColor = idx < 3 ? placementColors[idx] : "white";

              return (
                <div key={idx} style={{ marginBottom: 16 }}>
                  <div style={style.gameResultsPlayer.top}>
                    <span style={style.gameResultsPlayer.placeNum(placementColor)}>{idx + 1}</span>
                    <span style={style.gameResultsPlayer.name}>{player.name}</span>
                    <div style={{ textAlign: "right", lineHeight: 1 }}>
                      <p style={style.gameResultsPlayer.prevPoints}>{player.pts} pts</p>
                      <p style={style.gameResultsPlayer.ptsAwarded}>+{player.ptsAwarded} pts</p>
                    </div>
                  </div>
                  <p style={style.gameResultsPlayer.pts}>{player.pts + player.ptsAwarded} pts</p>
                </div>
              )
            })}
          </div>
          <div style={style.nextGameContainer}>
            <p style={style.nextGameText}>NEXT GAME</p>
            <p style={style.gameTitleText}>{games[gameNum + 1]}</p>
            <p style={style.startsInText}>
              Starts in: <span style={{ fontWeight: "bold" }}>{count}</span>
            </p>
          </div>
        </div>
      );
    }
  }
}

function Game({ connected, players, game }) {
  switch (game) {
    case "Sudoku":
      return <Sudoku connected={connected} players={players} />
    case "Battleship":
      return <Battleship connected={connected} players={players} />
    case "Pictionary":
      return <Pictionary connected={connected} players={players} />
    default:
      return null;
  }
}