import { useEffect, useState } from 'react'
import socketClient from "./socketClient"

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

export default function Battleship({ connected, players }) {
  const [gameData, setGameData] = useState({ playerGameData: [], turn: 0, next: 0, selectedCell: null });

  const { playerGameData, turn, next, selectedCell } = gameData;
  
  const attacker = playerGameData[turn];
  const attackerPlayer = getPlayer(players, attacker);
  const attacked = playerGameData[attacker?.attacking ?? 0];
  const attackedPlayer = getPlayer(players, attacked);
  const theNext = next === -1 ? null : playerGameData[next];
  const nextPlayer = getPlayer(players, theNext);
  const shotResult = getShotResult();

  const connectedPlayers = players.filter(player => !player.isDisconnected);
  const gameWon = connectedPlayers.filter(player => !player.done).length === 1;
  const allOthersDisconnected = connectedPlayers.length < 2;
  const gameDone = gameWon || allOthersDisconnected;

  useEffect(() => {
    if (connected) {
      socketClient.subscribe("/topic/battleshipInitGame", message => {
        setGameData(JSON.parse(message.body));
      });

      socketClient.subscribe("/topic/battleshipUpdateGame", message => {
        setGameData(JSON.parse(message.body));
      });

      socketClient.publish({ destination: "/app/battleshipInitGame" });
    }
  }, [connected])

  useEffect(() => {
    if (connected) {
      // Ensure the continuity of the game is preserved upon a player disconnecting (client-side)
      const subscription = socketClient.subscribe("/topic/playerDisconnected", message => {
        const newPlayers = JSON.parse(message.body);
        const newPlayerGameData = gameData.playerGameData.slice();
       
        // If any player is attacking a disconnected player, ensure that their new
        // target is the next connected player.
        for (let i = 0; i < newPlayerGameData.length; i++) {
          let attacking = newPlayerGameData[i].attacking;
          let attackedPlayer = getPlayer(newPlayers, newPlayerGameData[attacking]);
          
          while (attackedPlayer.isDisconnected && attacking !== i) {
            attacking = (attacking + 1) % newPlayers.length;
            attackedPlayer = getPlayer(newPlayers, newPlayerGameData[attacking]);
          }

          newPlayerGameData[i] = { ...newPlayerGameData[i], attacking };
        }
        
        // If a disconnected player has the current turn, make it the next connected player's turn
        let newTurn = gameData.turn;
        let attackingPlayer = getPlayer(newPlayers, newPlayerGameData[newTurn]);

        while (attackingPlayer.isDisconnected && newTurn !== (gameData.turn - 1) % newPlayers.length) {
          newTurn = (newTurn + 1) % newPlayers.length;
          attackingPlayer = getPlayer(newPlayers, newPlayerGameData[newTurn]);
        }

        const newGameData = { ...gameData, playerGameData: newPlayerGameData, turn: newTurn };
        socketClient.publish({ destination: "/app/battleshipUpdateGame", body: JSON.stringify(newGameData) });
      });

      return () => subscription.unsubscribe();
    }
  }, [connected, gameData])

  useEffect(() => {
    if (connected && gameDone)
      setTimeout(() => {
        socketClient.publish({ destination: "/app/endGame" });
      }, 3000);
  }, [connected, gameDone])

  // Check that all of the cells that all ships occupy have been hit
  function areAllShipsSunk(ships, board) {
    return ships.every(ship => ship.every(cell => board[cell[0]][cell[1]]));
  }

  function getPlayer(players, item) {
    return item ? players.find(player => player.id === item.playerId) : null;
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
    let { turn, next, selectedCell } = gameData;

    if (!gameDone && attackerPlayer.isMe && !attacked.board[i][j] && !selectedCell) {
      const playerGameData = gameData.playerGameData.slice();
      const newPlayers = players.slice();

      const attackedIdx = playerGameData[turn].attacking;
       // Get board data for the player that is currently being attacked
      const board = playerGameData[attackedIdx].board.map(row => row.slice());
      
      board[i][j] = true; // Mark cell as chosen
      playerGameData[attackedIdx] = { ...playerGameData[attackedIdx], board };
      
      const allShipsSunk = areAllShipsSunk(playerGameData[attackedIdx].ships, board);
      const twoLeft = connectedPlayers.filter(player => !player.done).length === 2;

      if (allShipsSunk) {
        const attackerPlayerIdx = newPlayers.findIndex(player => player.id === attackerPlayer.id);
        const attackedPlayerIdx = newPlayers.findIndex(player => player.id === attackedPlayer.id);
        
        if (attackedPlayerIdx > -1) // Mark attacked player as done (eliminated)
          newPlayers[attackedPlayerIdx] = { ...newPlayers[attackedPlayerIdx], done: true };

        // Award a point when a player eliminates another player; double if player scores the winning eliminiation
        if (attackerPlayerIdx > -1)
          newPlayers[attackerPlayerIdx] = {
            ...newPlayers[attackerPlayerIdx],
            ptsAwarded: newPlayers[attackerPlayerIdx].ptsAwarded + (twoLeft ? 2 : 1)
          }

        next = -1;
        socketClient.publish({ destination: "/app/updatePlayers", body: JSON.stringify(newPlayers) });
      } else {
        // After a player takes their turn, it is then the turn of the player that was attacked
        turn = attackedIdx; 
        next = attackedIdx;
      }

      let newGameData = { ...gameData, playerGameData, next, selectedCell: [i, j] };
      socketClient.publish({ destination: "/app/battleshipUpdateGame", body: JSON.stringify(newGameData) });

      setTimeout(() => {
        if (allShipsSunk) {
          if (!twoLeft) {
            // If a player eliminates someone, they will now attack 
            // whoever the eliminated player was attacking
            playerGameData[turn] = { 
              ...playerGameData[turn], 
              attacking: playerGameData[attackedIdx].attacking 
            }
            newGameData = { ...newGameData, playerGameData, selectedCell: null };
          }
        } else {
          newGameData = { ...newGameData, turn, selectedCell: null };
        }

        socketClient.publish({ destination: "/app/battleshipUpdateGame", body: JSON.stringify(newGameData) });
      }, 3000)
    }
  }

  return (
    <div style={style.flexCenterContainer}>
      <div style={style.innerContainer}>
        <div>
          <div style={style.header}>
            {attackerPlayer?.isMe && <p style={{ fontSize: 18, color: "forestgreen" }}>YOUR TURN</p>}
            <p style={style.infoText}>
              {selectedCell ? (
                (!gameWon && nextPlayer) && (
                  <>
                    <span style={style.playerText(nextPlayer.color)}>
                      {nextPlayer.isMe ? "You" : nextPlayer.name}
                    </span>
                    {nextPlayer.isMe ? " are next..." : " is next..."}
                  </>
                )
              ) : (
                <>
                  {!attackerPlayer?.isMe && (
                    <span style={style.playerText(attackerPlayer?.color)}>{attackerPlayer?.name}</span>
                  )}
                  {!attackerPlayer?.isMe ? ` is ` : ""}Attacking
                  <span style={style.playerText(attackedPlayer?.color)}>
                    {" "}{attackedPlayer?.isMe ? "You" : attackedPlayer?.name}...
                  </span>
                </>
              )}
            </p>
          </div>
          <div style={style.board(attackerPlayer?.isMe)}>
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} style={style.boardRow}>
                {Array.from({ length: 10 }, (_, j) => {
                  const ship = getShip(attacked?.ships ?? [], i, j);
                  const isShipSunk = ship && ship.every(cell => attacked.board[cell[0]][cell[1]]);

                  return (
                    <div key={j} onClick={() => selectCell(i, j)} style={style.boardCell}>
                      {ship && (attackedPlayer?.isMe || isShipSunk) && <ShipSegment ship={ship} i={i} j={j} />}
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
            {gameWon ? (
              <span style={{ color: "forestgreen" }}>
                {gameDone && (
                  (attackerPlayer?.isMe || allOthersDisconnected) 
                    ? "YOU WIN!" 
                    : `${attackerPlayer?.name} HAS WON!`
                  )}
              </span>
            ) : (attacked && areAllShipsSunk(attacked.ships, attacked.board)) ? (
              <span>
                All SHIPS SUNK! 
                {attackedPlayer?.isMe ? " You are " : ` ${attackedPlayer?.name} has been `}eliminated.
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