import { useEffect, useState } from 'react'

const style = {
  flexCenterContainer: {
    width: "100%", 
    height: "100%", 
    display: "flex", 
    flexDirection: "column", 
    justifyContent: "center", 
    alignItems: "center"
  },
  innerContainer: { width: "fit-content", display: "flex", flexDirection: "column", alignItems: "center" },
  header: { marginBottom: 16, display: "flex", width: "100%", alignItems: "center" },
  infoText: { fontSize: 16, flex: 1, textAlign: "right" },
  playerText: color => ({ color, fontWeight: "bold" }),
  board: myTurn => ({ 
    border: "1px solid dodgerblue", 
    borderWidth: "1px 0 0 1px", 
    opacity: myTurn ? 1 : 0.5, 
    cursor: myTurn ? "pointer" : "default" 
  }),
  boardRow: { display: "flex", borderBottom: "1px solid dodgerblue", width: "fit-content" },
  boardCell: {
    width: 40, 
    height: 40, 
    borderRight: "1px solid dodgerblue", 
    backgroundColor: "rgb(193, 252, 255)", 
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
    backgroundColor: hit ? "red" : "dodgerblue", 
    borderRadius: "50%"
  }),
  gameEndText: {
    color: "maroon", 
    fontSize: 20, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginTop: 16, 
    fontStyle: "italic",
    height: 22
  },
  shotResultText: shotResult => ({
    fontWeight: "bold", 
    color: shotResult === "SHIP SUNK!" || shotResult === "HIT!" ? "red" : "dodgerblue", 
    fontSize: 20, 
    marginTop: 24, 
    textAlign: "center", 
    lineHeight: 1, 
    fontStyle: "italic",
    visibility: shotResult ? "visible" : "hidden",
    heigth: 22
  }),
  shipSegmentSvg: rotateDeg => ({ transform: `translate(-0.5px) rotate(${rotateDeg}deg) scale(1, 1.2)` })
};

export default function Battleship({ socket, gameState }) {
  const [gameData, setGameData] = useState({ playerGameData: [], turn: 0, next: 0, selectedCell: null });

  const { playerGameData, turn, next, selectedCell } = gameData;
  
  const attacker = playerGameData[turn];
  const attackerUser = getUser(gameState.users, attacker);
  const attacked = playerGameData[attacker?.attacking ?? 0];
  const attackedUser = getUser(gameState.users, attacked);
  const theNext = next === -1 ? null : playerGameData[next];
  const nextUser = getUser(gameState.users, theNext);
  const shotResult = getShotResult();

  const isGameWon = gameState.users.filter(user => !user.done).length < 2;

  useEffect(() => {
    socket.subscribe("/game/battleshipInitGame", data => {
      if (data) setGameData(data);
    });
    socket.subscribe("/game/battleshipUpdateGame", data => setGameData(data));

    socket.battleshipInitGame();
  }, [])
  
  useEffect(() => {
    if (isGameWon && gameState.users[0].isMe)
      setTimeout(() => socket.endGame(), 2500)
  }, [isGameWon])

  useEffect(() => {
    console.log(gameData)
  }, [gameData])

  // Check that all of the cells that all ships occupy have been hit
  function areAllShipsSunk(ships, board) {
    return ships.every(ship => ship.every(cell => board[cell[0]][cell[1]]));
  }

  function getUser(users, playerGameData) {
    return playerGameData ? users.find(user => user.id === playerGameData.playerId) : null;
  }

  function getShip(ships, i, j) { // find if there is a ship that occupies the cell at row i col j
    for (const ship of ships) {
      for (const cell of ship) {
        if (cell[0] === i && cell[1] === j)
          return ship;
      }
    }

    return null;
  }

  function getShotResult() {
    if (selectedCell) {
      const [row, col] = selectedCell;
      const ship = getShip(attacked.ships, row, col);

      if (ship) {
        if (ship.every(cell => attacked.board[cell[0]][cell[1]]))
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

  function selectCell(i, j) {
    if (!isGameWon && attackerUser.isMe && !attacked.board[i][j] && !gameData.selectedCell)
      socket.battleshipSelectCell(i, j);
  }

  return (
    <div style={style.flexCenterContainer}>
      <div style={style.innerContainer}>
        <div>
          <div style={style.header}>
            {attackerUser?.isMe && <p style={{ fontSize: 18, color: "forestgreen" }}>YOUR TURN</p>}
            <p style={style.infoText}>
              {selectedCell ? (
                (!isGameWon && nextUser) && (
                  <>
                    <span style={style.playerText(nextUser.color)}>
                      {nextUser.isMe ? "You" : nextUser.username}
                    </span>
                    {nextUser.isMe ? " are next..." : " is next..."}
                  </>
                )
              ) : (
                <>
                  {!attackerUser?.isMe && (
                    <span style={style.playerText(attackerUser?.color)}>{attackerUser?.username}</span>
                  )}
                  {!attackedUser?.isMe && !attackerUser?.isMe ? ` is ` : " "}Attacking
                  <span style={style.playerText(attackedUser?.color)}>
                    {" "}{attackedUser?.isMe ? "You" : attackedUser?.username}...
                  </span>
                </>
              )}
            </p>
          </div>
          <div style={style.board(attackerUser?.isMe)}>
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} style={style.boardRow}>
                {Array.from({ length: 10 }, (_, j) => {
                  const ship = getShip(attacked?.ships ?? [], i, j);
                  const isShipSunk = ship && ship.every(cell => attacked.board[cell[0]][cell[1]]);

                  return (
                    <div key={j} onClick={() => selectCell(i, j)} style={style.boardCell}>
                      {ship && (attackedUser?.isMe || isShipSunk) && <ShipSegment ship={ship} i={i} j={j} />}
                      {attacked?.board[i][j] && <div style={style.shot(!!ship)} />}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={style.gameEndText}>
            {isGameWon ? (
              <span style={{ color: "forestgreen" }}>
                {(attackerUser?.isMe) ? "YOU WIN!" : `${attackerUser?.username} HAS WON!`}
              </span>
            ) : (attacked && areAllShipsSunk(attacked.ships, attacked.board)) ? (
              <span>
                All SHIPS SUNK! 
                {attackedUser?.isMe ? " You are " : ` ${attackedUser?.username} has been `}eliminated.
              </span>
            ) : shotResult && <span style={style.shotResultText(shotResult)}>{shotResult}</span>}
          </p>
        </div>
      </div>
    </div>
  )
}

function ShipSegment({ship, i, j}) {
  const svgProps = { width: 35, height: 35, viewBox: "0 0 500 500", fill: "none", opacity: 0.6 };

  if (ship.length <= 1) {
    return ( // render whole boat if length is one
      <svg {...svgProps} viewBox="0 0 500 500" style={{ transform: "translate(-0.5px)" }}>
        <g>
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
        <svg {...svgProps} viewBox="0 0 500 500" style={style.shipSegmentSvg(horizontal ? 90 : 0)}>
          <g>
            <line style={{ fill: 'rgb(216, 216, 216)', stroke: 'rgb(0, 0, 0)', strokeWidth: '42px' }} x1="77.6" y1="0" x2="77.4" y2="500"></line>
            <line style={{ fill: 'rgb(216, 216, 216)', stroke: 'rgb(0, 0, 0)', strokeWidth: '42px' }} x1="422.5" y1="0" x2="422.2" y2="500"></line>
          </g>
        </svg>
      )
    } else {
      const rotateDeg = horizontal ? 90 * (idx === 0 ? -1 : 1) : (idx === 0 ? 0 : 180);
      return ( // render the end of the boat and rotate based on whether end is up/right/left/down
        <svg {...svgProps} viewBox="0 0 500 500" style={style.shipSegmentSvg(rotateDeg)}>
          <g>
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