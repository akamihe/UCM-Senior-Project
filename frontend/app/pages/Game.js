import { useState, useEffect } from "react";
import { FaCircleCheck, FaCircleXmark } from "react-icons/fa6";
import Battleship from "./Battleship";
import Sudoku from "./Sudoku";

const style = {
  container: { display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" },
  gameSection: { 
    display: "flex", 
    overflow: "hidden",
    width: "100%", 
    height: "100%",
    flexWrap: "wrap" 
  },
  playerInfoSection: { display: "flex", borderTop: "1px solid #0004", gap: 16, padding: 16 },
  playerInfoItem: {
    item: { 
      display: "flex", 
      alignItems: "center", 
      position: "relative",
      flex: 1, 
      border: "1px solid #0004", 
      padding: 8,
      borderRadius: 8,
    },
    pts: { 
      border: "1px solid #0004", 
      padding: "4px 8px", 
      borderRadius: 16, 
      fontWeight: "bold", 
      fontSize: 14 
    },
    doneIcon: { color: "#0b0", position: "absolute", top: -8, right: -8, fontSize: 20 }
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
      width: 29, 
      fontSize: 18, 
      margin: "2px 12px 0 0", 
      color, 
      border: `1px solid ${color}`, 
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
  gameInstanceRow: { display: "flex", flex: 1, height: "50%" },
  gameInstanceCellL: { flex: 1, height: "100%", borderRight: "1px solid #0002" },
  gameInstanceCellR: { flex: 1, height: "100%" },
  gameInstanceContent: { transform: "scale(0.6)", transformOrigin: "top", paddingTop: 8 }
}

const COUNTDOWN_LENGTH = 10;
const initialPlayers = [
  { id: 1, name: "john_doe", pts: 0, done: false, ptsAwarded: 0 },
  { id: 2, name: "jane_doe", pts: 0, done: false, ptsAwarded: 0 },
  { id: 3, name: "jack_doe", you: true, pts: 0, done: false, ptsAwarded: 0 },
  { id: 4, name: "jill_doe", pts: 0, done: false, ptsAwarded: 0 }
]
const games = ["Sudoku", "Battleship"];

const Game = () => {
  const [count, setCount] = useState(COUNTDOWN_LENGTH);
  const [gameNum, setGameNum] = useState(-1); // index of current game
  const [isGameActive, setIsGameActive] = useState(false); // flag for showing the current game
  const [players, setPlayers] = useState(initialPlayers.map(player => ({ ...player })));

  const playersSortedByPts = players.slice().sort((a, b) => b.pts - a.pts);
  const game = gameNum >= 0 ? games[gameNum] : "";
  const nextGame = games[gameNum + 1];
  const elimination = game === "Battleship";

  useEffect(() => {
    if (!isGameActive)
      countDown(COUNTDOWN_LENGTH);
  // once the component inits or a game finishes, display the next game in COUNTDOWN_LENGTH seconds;
  }, [isGameActive]) 

  function countDown(count) {
    setCount(count)

    if (count > 0) {
      setTimeout(() => countDown(count - 1), 1000);
    } else {
      // once countdown finishes, display the next game, reset game state 
      // and add the points awarded from the previous game
      setPlayers(players.map(player => ({ ...player, done: false, pts: player.pts + player.ptsAwarded, ptsAwarded: 0 })));
      setGameNum(gameNum + 1);
      setIsGameActive(true);
    }
  }

  function handleGameComplete() {
    setIsGameActive(false); // show results after game finishes
  }

  function renderGame(game) {
    switch (game) {
      case "Sudoku":
        return <Sudoku onGameComplete={handleGameComplete} onSetPlayer={setPlayer} players={players} />
      case "Battleship":
        return <Battleship onGameComplete={handleGameComplete} onSetPlayer={setPlayer} players={players} />
      default:
        return null;
    }
  }

  function setPlayer(player) {
    setPlayers(prev => {
      const newPlayers = prev.slice();
      const idx = newPlayers.findIndex(u => u.id === player.id);
      newPlayers[idx] = player;
      return newPlayers
    });
  }

  return (
    <div style={style.container}>
      {isGameActive ? (
        <>
          <div style={style.gameSection}>{renderGame(game)}</div>
          <div style={style.playerInfoSection}>
            {players.map((player, idx) => (
              <div key={idx} style={style.playerInfoItem.item}>
                <span style={{ flex: 1, marginRight: 8 }}>{player.name}</span>
                <span style={style.playerInfoItem.pts}>{player.pts + player.ptsAwarded} pts</span>
                {player.done && 
                  (elimination 
                    ? <FaCircleXmark style={{ ...style.playerInfoItem.doneIcon, color: "red" }} />
                    : <FaCircleCheck style={style.playerInfoItem.doneIcon} />)
                }
              </div>
            ))}
          </div>
        </>
      ) : gameNum === -1 ? (
        <>
          <p style={style.gameTitleText}>{nextGame}</p>
          <p style={style.startsInText}>
            Game starts in: <span style={{ fontWeight: "bold" }}>{count}</span>
          </p>
        </>
      ) : (
        <div style={style.gameResultsContainer}>
          <div style={{ width: 600 }}>
            {playersSortedByPts.map((player, idx) => {
              const placementColor = ["#ddc700", "#aaaaaa", "#905923", "#000000"][idx];

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
            <p style={style.gameTitleText}>{nextGame}</p>
            <p style={style.startsInText}>
              Starts in: <span style={{ fontWeight: "bold" }}>{count}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Game;