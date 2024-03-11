import { useState, useEffect, useMemo } from "react";
import Sudoku from "./Sudoku";
import Battleship from "./Battleship";
import { FaCircleCheck, FaCircleXmark } from "react-icons/fa6";
import SudokuPuzzle from "./SudokuPuzzle";

const style = {
  container: { display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" },
  gameSection: { 
    display: "flex", 
    flexDirection: 'column', 
    overflow: "hidden",
    width: "100%", 
    height: "100%" 
  },
  userInfoSection: { display: "flex", borderTop: "1px solid #0004", gap: 16, padding: 16 },
  userInfoItem: {
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
  gameResultsUser: {
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

const initialUsers = [
  { id: 1, name: "john_doe", },
  { id: 2, name: "jane_doe", },
  { id: 3, name: "jack_doe", you: true },
  { id: 4, name: "jill_doe", }
]

// const games = ["Sudoku", "Battleship"];
const games = ["Battleship"]

const Game = () => {
  const [count, setCount] = useState(10);
  const [gameNum, setGameNum] = useState(-1);
  const [isGameActive, setIsGameActive] = useState(false);

  const [users, setUsers] = useState(initialUsers.map((user, idx) => ({
    ...user,
    pts: 0,
    done: false,
    eliminated: false,
    ptsAwarded: 0,
    board: new Array(10).fill(new Array(10).fill(false)),
    ships: [
      // [ [0, 3], [0, 4], [0, 5], [0, 6] ],
      // [ [3, 1], [4, 1], [5, 1] ],
      // [ [5, 8] ],
      [ [8, 4], [8, 5] ],
      // [ [8, 9], [9, 9] ]
    ],
    attacking: (idx + 1) % initialUsers.length
  })));

  const [turn, setTurn] = useState(0);
  const [turnNum, setTurnNum] = useState(0);
  const [selectedCell, setSelectedCell] = useState(null);

  const sudokuPuzzle = useMemo(() => {
    return SudokuPuzzle.generatePuzzle();
  }, [])

  const gameFinished = (
    users.every(user => user.done) || 
    users.filter(user => user.eliminated).length === users.length - 1
  );

  useEffect(() => {
    if (!isGameActive)
      // countDown(10);
      countDown(0);
  }, [isGameActive])

  useEffect(() => {
    if (gameFinished) {
      setTimeout(() => {
        setUsers(users.map(user => ({ ...user, done: false, eliminiated: false, pts: user.pts + user.ptsAwarded })));
        setIsGameActive(false);
      }, 3000);
    }
  }, [gameFinished])

  function countDown(count) {
    setCount(count)

    if (count > 0) {
      setTimeout(() => {
        countDown(count - 1);
      }, 1000);
    } else {
      setGameNum(gameNum + 1);
      setIsGameActive(true);
    }
  }

  function markUserAsDone(idx) {
    setUsers(prev => {
      const newUsers = prev.slice();
      const ptsAwarded = 4 - (newUsers.filter(user => user.done).length + 1);
      newUsers[idx] = { ...newUsers[idx], done: true, ptsAwarded };
      return newUsers;
    })
  }

  function handleTurnComplete(i, j) {
    const newUsers = users.slice();
    const attackedIdx = users[turn].attacking;
    const board = newUsers[attackedIdx].board.map(row => row.slice());
    const twoLeft = newUsers.filter(user => user.eliminated).length === 2;

    board[i][j] = true; 

    const allShipsSunk = newUsers[attackedIdx].ships.every(ship => {
      return ship.every(cell => board[cell[0]][cell[1]]);
    });

    newUsers[attackedIdx] = { ...newUsers[attackedIdx], board, eliminated: allShipsSunk };
    newUsers[turn] = { 
      ...newUsers[turn],
      ptsAwarded: newUsers[turn].ptsAwarded + (allShipsSunk ? (twoLeft ? 2 : 1) : 0)
    };

    setTimeout(() => {
      if (allShipsSunk)
        newUsers[turn] = { ...newUsers[turn], attacking: newUsers[attackedIdx].attacking };
      else
        setTurn(attackedIdx);
      
      setSelectedCell(null);
      setTurnNum(turnNum + 1);
    }, 2500);
    
    setSelectedCell([i, j]);
    setUsers(newUsers);
  }

  function getShip(ships, i, j) {
    for (const ship of ships) {
      for (const cell of ship) {
        if (cell[0] === i && cell[1] === j)
          return ship;
      }
    }

    return null;
  }

  const attacked = users[users[turn].attacking];

  function renderGame(game) {
    if (game === "Sudoku") {
      return (
        <>
          <div style={{ ...style.gameInstanceRow, borderBottom: "1px solid #0002" }}>
            <div style={style.gameInstanceCellL}>
              <div style={style.gameInstanceContent}>
                <Sudoku puzzle={sudokuPuzzle} onComplete={() => markUserAsDone(0)} />
              </div>
            </div>
            <div style={style.gameInstanceCellR}>
              <div style={style.gameInstanceContent}>
                <Sudoku puzzle={sudokuPuzzle} onComplete={() => markUserAsDone(1)} />
              </div>
            </div>
          </div>
          <div style={style.gameInstanceRow}>
            <div style={style.gameInstanceCellL}>
              <div style={style.gameInstanceContent}>
                <Sudoku puzzle={sudokuPuzzle} onComplete={() => markUserAsDone(2)} />
              </div>
            </div>
            <div style={style.gameInstanceCellR}>
              <div style={style.gameInstanceContent}>
                <Sudoku puzzle={sudokuPuzzle} onComplete={() => markUserAsDone(3)} />
              </div>
            </div>
          </div>
        </>
      )
    } else if (game === "Battleship") {
      const instances = users.map(user => (
        <Battleship
          turn={{
            attacker: users[turn],
            attacked,
            next: attacked.eliminated ? users[attacked.attacking] : attacked, 
            turn: turnNum,
            selectedCell
          }}
          onTurnComplete={handleTurnComplete}
          user={user}
        />
      ))

      return (
        <>
          <div style={{ ...style.gameInstanceRow, borderBottom: "1px solid #0002" }}>
            <div style={style.gameInstanceCellL}>
              <div style={style.gameInstanceContent}>
                {instances[0]}
              </div>
            </div>
            <div style={style.gameInstanceCellR}>
              <div style={style.gameInstanceContent}>
                {instances[1]}
              </div>
            </div>
          </div>
          <div style={style.gameInstanceRow}>
            <div style={style.gameInstanceCellL}>
              <div style={style.gameInstanceContent}>
                {instances[2]}
              </div>
            </div>
            <div style={style.gameInstanceCellR}>
              <div style={style.gameInstanceContent}>
                {instances[3]}
              </div>
            </div>
          </div>
        </>
      )
    }
  
    return null;
  }

  const usersSortedByPts = users.slice().sort((a, b) => b.pts - a.pts);
  const game = gameNum >= 0 ? games[gameNum] : "";
  const nextGame = games[gameNum + 1];

  return (
    <div style={style.container}>
      {isGameActive ? (
        <>
          <div style={style.gameSection}>
            {renderGame(game)}
          </div>
          <div style={style.userInfoSection}>
            {users.map((user, idx) => (
              <div key={idx} style={style.userInfoItem.item}>
                <span style={{ flex: 1, marginRight: 8 }}>{user.name}</span>
                <span style={style.userInfoItem.pts}>{user.pts} pts</span>
                {user.done && <FaCircleCheck style={style.userInfoItem.doneIcon} />}
                {user.eliminated && <FaCircleXmark style={{ ...style.userInfoItem.doneIcon, color: "red" }} />}
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
            {usersSortedByPts.map((user, idx) => {
              const placementColor = ["#ddc700", "#aaaaaa", "#905923", "#000000"][idx];

              return (
                <div key={idx} style={{ marginBottom: 16 }}>
                  <div style={style.gameResultsUser.top}>
                    <span style={style.gameResultsUser.placeNum(placementColor)}>{idx + 1}</span>
                    <span style={style.gameResultsUser.name}>{user.name}</span>
                    <div style={{ textAlign: "right", lineHeight: 1 }}>
                      <p style={style.gameResultsUser.prevPoints}>{user.pts - user.ptsAwarded} pts</p>
                      <p style={style.gameResultsUser.ptsAwarded}>+{user.ptsAwarded} pts</p>
                    </div>
                  </div>
                  <p style={style.gameResultsUser.pts}>{user.pts} pts</p>
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