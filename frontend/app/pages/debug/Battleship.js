import { useState } from "react";
import MultiScreens from "/app/components/MultiScreens"

const style = {
  gameInstanceRow: { display: "flex", flex: 1, height: "50%" },
  gameInstanceCellL: { flex: 1, height: "100%", borderRight: "1px solid #0002" },
  gameInstanceCellR: { flex: 1, height: "100%" },
  gameInstanceContent: { transform: "scale(0.6)", transformOrigin: "top", paddingTop: 8 },
  container: { width: "100%", height: "100%", display: "flex", justifyContent: "center" },
  contentContainer: { width: "fit-content", display: "flex", flexDirection: "column", alignItems: "center" },
  header: { marginBottom: 8, display: "flex", width: "100%" },
  attackingText: { fontSize: 15, flex: 1, textAlign: "right" },
  board: myTurn => ({ 
    border: "1px solid #008dff", 
    borderWidth: "1px 0 0 1px", 
    opacity: myTurn ? 1 : 0.6, 
    cursor: myTurn ? "pointer" : "default" 
  }),
  boardRow: { display: "flex", borderBottom: "1px solid #008dff", width: "fit-content" },
  boardCell: {
    width: 35, 
    height: 35, 
    borderRight: "1px solid #008dff", 
    backgroundColor: "#b7dfff", 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    position: "relative"
  },
  shot: hit => ({
    position: "absolute", 
    top: "50%", 
    transform: "translate(0, -50%)", 
    width: "45%", 
    height: "45%", 
    backgroundColor: hit ? "red" : "white", 
    borderRadius: "50%", 
    border: "1px solid #0007"
  }),
  gameEndText: {
    color: "#800", 
    fontSize: 18, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginTop: 16, 
    fontStyle: "italic"
  },
  shotResultText: shotResult => ({
    fontWeight: "bold", 
    color: shotResult === "SHIP SUNK!" || shotResult === "HIT!" ? "red" : "#9cc", 
    fontSize: 18, 
    marginTop: 24, 
    textAlign: "center", 
    lineHeight: 1, 
    fontStyle: "italic"
  }),
  shipSegmentSvg: rotateDeg => ({ transform: `translate(-0.5px) rotate(${rotateDeg}deg) scale(1, 1.1)` })
}

export default function Battleship({ players, onSetPlayer, onGameComplete }) {
  const [done, setDone] = useState(false);
  const [next, setNext] = useState(0); // index of the next player
  const [turn, setTurn] = useState(0); // index of the current player
  const [selectedCell, setSelectedCell] = useState(null);
  const [playersGameData, setPlayersGameData] = useState(players.map((player, idx) => ({
    player, // player data from Game.js
    // 2D array of booleans where a true value means the cell has already been chosen
    board: new Array(10).fill(new Array(10).fill(false)),
    // Each ship in the array is an array of coordinates that specify which cells the ship occupies
    ships: [ 
      [ [0, 3], [0, 4], [0, 5], [0, 6] ],
      [ [3, 1], [4, 1], [5, 1] ],
      [ [5, 8] ],
      [ [8, 4], [8, 5] ],
      [ [8, 9], [9, 9] ]
    ],
    // idx of the player that a player is attacking; currently set to the next player
    attacking: (idx + 1) % players.length 
  })));

  const attacker = playersGameData[turn];
  const attacked = playersGameData[playersGameData[turn].attacking];

  function selectCell(i, j) {
    const newPlayersGameData = playersGameData.slice();
    const attackedIdx = playersGameData[turn].attacking;
    // get board data for the player that is currently being attacked
    const board = newPlayersGameData[attackedIdx].board.map(row => row.slice());
    const twoLeft = players.filter(player => player.done).length === 2;

    board[i][j] = true; // mark cell as chosen

    const allShipsSunk = newPlayersGameData[attackedIdx].ships.every(ship => {
      return ship.every(cell => board[cell[0]][cell[1]]);
    }); // check that all of the cells that all ships occupy have been hit
     // if there are 2 players left and the attacker sunk all of the other player's ships, victory
    const attackerWon = allShipsSunk && twoLeft;
   
    newPlayersGameData[attackedIdx] = { ...newPlayersGameData[attackedIdx], board };
   
    if (allShipsSunk) {
      // award a point when a player eliminates another player; double if player scores the winning eliminiation
      const newPtsAwarded = newPlayersGameData[turn].player.ptsAwarded + (twoLeft ? 2 : 1);
      const newPlayer = { ...newPlayersGameData[turn].player, ptsAwarded: newPtsAwarded };
      // mark attacked player as done (eliminated)
      const newAttackedPlayer = { ...newPlayersGameData[attackedIdx].player, done: true };

      newPlayersGameData[turn] = { ...newPlayersGameData[turn], player: newPlayer };
      newPlayersGameData[attackedIdx] = { ...newPlayersGameData[attackedIdx], player: newAttackedPlayer };

      // set the user data from Game.js using onSetPlayer prop
      onSetPlayer(newPlayer);
      onSetPlayer(newAttackedPlayer);
    }

    if (attackerWon) {
      setTimeout(onGameComplete, 3000);
      setDone(true);
    } else {
      setTimeout(() => {
        if (allShipsSunk)
          newPlayersGameData[turn] = { ...newPlayersGameData[turn], attacking: newPlayersGameData[attackedIdx].attacking };
        else
          // After a player takes their turn, it is then the turn of the player that was attacked
          setTurn(attackedIdx); 
       
        setSelectedCell(null);
      }, 2500);
  
      setNext(allShipsSunk ? newPlayersGameData[attackedIdx].attacking : attackedIdx);
    }

    setSelectedCell([i, j]);
    setPlayersGameData(newPlayersGameData);
  }

  return (
    <MultiScreens 
      instances={playersGameData.map(playerGameData => ( // create instances for each player
        <BattleshipInstance
          // current turn info such as who attacks who, whose turn it is, etc.
          turn={{ attacker, attacked, next: playersGameData[next], selectedCell }} 
          onSelectCell={selectCell}
          playerGameData={playerGameData}
          gameWon={done}
        />
      ))} 
    />
  )
}

function BattleshipInstance({ turn, onSelectCell, playerGameData, gameWon }) {
  const gameOver = turn.attacked.ships.every(ship => {
    return ship.every(cell => turn.attacked.board[cell[0]][cell[1]]);
  });; // gave over if the currently attacked ship has all ships sunk

  const board = turn.attacked.board;
  const myTurn = turn.attacker.player.id === playerGameData.player.id;
  const isAttacked = turn.attacked.player.id === playerGameData.player.id;
  const isNext = turn.next.player.id === playerGameData.player.id;

  const shotResult = getShotResult();

  function hitCell(i, j) {
    if (!turn.selectedCell && myTurn && !isAttacked && !turn.attacked.board[i][j])
      onSelectCell(i, j);
  }

  function getShip(i, j) { // find if there is a ship that occupies the cell at row i col j
    const ships = turn.attacked.ships;

    for (const ship of ships) {
      for (const cell of ship) {
        if (cell[0] === i && cell[1] === j)
          return ship;
      }
    }

    return null;
  }

  function getShotResult() {
    if (turn.selectedCell) {
      const [row, col] = turn.selectedCell;
      const ship = getShip(row, col);

      if (ship) {
        if (ship.every(cell => turn.attacked.board[cell[0]][cell[1]]))
          return "SHIP SUNK!";
        else
          return "HIT!";
      } else {
        return "MISS!";
      }
    } else {
      return "";
    }
  }

  return (
    <div style={style.container}>
      <div style={style.contentContainer}>
        <div>
          <div style={style.header}>
            {myTurn && <p style={{ fontSize: 15, color: "forestgreen" }}>YOUR TURN</p>}
            <p style={style.attackingText}>
              {!myTurn && <span>{turn.attacker.player.name}</span>}
              {!myTurn ? ` is ` : ""}Attacking
              <span> {isAttacked ? "You" : turn.attacked.player.name}</span>
            </p>
          </div>
          <div style={style.board(myTurn)}>
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} style={style.boardRow}>
                {Array.from({ length: 10 }, (_, j) => {
                  const ship = getShip(i, j);
                  const isShipSunk = ship && ship.every(cell => turn.attacked.board[cell[0]][cell[1]])

                  return (
                    <div key={j} onClick={() => hitCell(i, j)} style={style.boardCell}>
                      {ship && (isAttacked || isShipSunk) && <ShipSegment ship={ship} i={i} j={j} />}
                      {board[i][j] && <div style={style.shot(!!ship)} />}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
        {gameWon ? (
          <p style={{ ...style.gameEndText, color: "forestgreen" }}>
            {myTurn ? "YOU WIN!" : `${turn.attacker.player.name} HAS WON!`}
          </p>
        ) : gameOver ? (
          <p style={style.gameEndText}>
            All SHIPS SUNK! {isAttacked ? "You are " : `${turn.attacked.player.name} has been `}eliminated.
          </p>
        ) : shotResult && (
          <p style={style.shotResultText(shotResult)}>{shotResult}</p>
        )}
        {shotResult && !gameWon && (
          <p style={{ color: "#777" }}>{isNext ? "You are " : `${turn.next.player.name} is `}next...</p>
        )}
      </div>
    </div>
  )
}

function ShipSegment({ship, i, j}) {
  const svgProps = { width: 35, height: 35, viewBox: "0 0 500 500", fill: "none", opacity: 0.6 };

  if (ship.length <= 1) {
    return ( // render whole boat if length is one
      <svg {...svgProps} style={{ transform: "translate(-0.5px)" }}>
        <g viewBox="0 0 500 500">
          <path
            style={{ fill: 'rgb(216, 216, 216)', stroke: 'rgb(0, 0, 0)', fillOpacity: 0, strokeWidth: '42px', transformBox: 'fill-box', transformOrigin: '50% 50%' }}
            d="M 422.558 239.693 C 422.558 239.693 246.664 200.826 245.658 33.941"
            transform="matrix(-1, 0, 0, -1, -0.000039, -0.000015)"
          />
          <path
            style={{ fill: 'rgb(216, 216, 216)', stroke: 'rgb(0, 0, 0)', fillOpacity: 0, strokeWidth: '42px' }}
            d="M 254.436 33.941 C 254.436 33.941 78.543 72.807 77.536 239.693"
          />
          <path
            style={{ fill: 'rgb(216, 216, 216)', stroke: 'rgb(0, 0, 0)', fillOpacity: 0, strokeWidth: '42px', transformOrigin: '334.107px 363.183px' }}
            d="M 422.558 260.307 C 422.558 260.307 246.664 299.173 245.658 466.058"
            transform="matrix(-1, 0, 0, -1, -0.000035, -0.000019)"
          />
          <path
            style={{ fill: 'rgb(216, 216, 216)', stroke: 'rgb(0, 0, 0)', fillOpacity: 0, strokeWidth: '42px' }}
            d="M 254.437 466.058 C 254.437 466.058 78.543 427.193 77.537 260.307"
          />
          <line
            style={{ fill: 'rgb(216, 216, 216)', stroke: 'rgb(0, 0, 0)', strokeWidth: '42px' }}
            x1="77.556" y1="236.743" x2="77.442" y2="264.153"
          />
          <line
            style={{ fill: 'rgb(216, 216, 216)', stroke: 'rgb(0, 0, 0)', strokeWidth: '42px' }}
            x1="422.525" y1="238.443" x2="422.41" y2="265.853"
          />
        </g>
      </svg>
    )
  } else {
    const horizontal = ship.map(cell => cell[0]).every(row => row === ship[0][0]);
    const idx = ship.findIndex(cell => cell[0] === i && cell[1] === j);
   
    if (idx > 0 && idx < ship.length - 1) {
      return ( // render middle portion of boat
        <svg {...svgProps} style={style.shipSegmentSvg(horizontal ? 90 : 0)}>
          <g viewBox="0 0 500 500">
            <line style={{ fill: 'rgb(216, 216, 216)', stroke: 'rgb(0, 0, 0)', strokeWidth: '42px' }} x1="77.6" y1="0" x2="77.4" y2="500"></line>
            <line style={{ fill: 'rgb(216, 216, 216)', stroke: 'rgb(0, 0, 0)', strokeWidth: '42px' }} x1="422.5" y1="0" x2="422.2" y2="500"></line>
          </g>
        </svg>
      )
    } else {
      const rotateDeg = horizontal ? 90 * (idx === 0 ? -1 : 1) : (idx === 0 ? 0 : 180);
      return ( // render the end of the boat and rotate based on whether end is up/right/left/down
        <svg {...svgProps} style={style.shipSegmentSvg(rotateDeg)}>
          <g viewBox="0 0 500 500">
            <path style={{ fill: 'rgb(216,216,216)', stroke: 'rgb(0,0,0)', fillOpacity: 0, strokeWidth: '42px', transformBox: 'fill-box', transformOrigin: '50% 50%' }} d="M 422.558 239.693 C 422.558 239.693 246.664 200.826 245.658 33.941" transform="matrix(-1, 0, 0, -1, -0.000039, -0.000015)" />
            <path style={{ fill: 'rgb(216,216,216)', stroke: 'rgb(0,0,0)', fillOpacity: 0, strokeWidth: '42px' }} d="M 254.436 33.941 C 254.436 33.941 78.543 72.807 77.536 239.693" />
            <line style={{ fill: 'rgb(216,216,216)', stroke: 'rgb(0,0,0)', strokeWidth: '42px' }} x1="77.556" y1="236.743" x2="77.4" y2="500" />
            <line style={{ fill: 'rgb(216,216,216)', stroke: 'rgb(0,0,0)', strokeWidth: '42px' }} x1="422.525" y1="238.443" x2="422.2" y2="500" />
          </g>
        </svg>
      );
    }
  }
}
