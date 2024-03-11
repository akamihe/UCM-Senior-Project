import { useEffect, useState } from "react";

const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

export default function Battleship({ turn, onTurnComplete, user }) {
  const gameOver = turn.attacked.ships.every(ship => {
    return ship.every(cell => turn.attacked.board[cell[0]][cell[1]]);
  });;

  const board = turn.attacked.board;
  const myTurn = turn.attacker.id === user.id; 
  const isAttacked = turn.attacked.id === user.id;
  const isNext = turn.next.id === user.id;

  const shotResult = getShotResult();

  function hitCell(i, j) {
    if (!shotResult && myTurn && !isAttacked && !turn.attacked.board[i][j])
      onTurnComplete(i, j);
  }

  function getShip(i, j) {
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

  function renderShipSegment(ship, i, j) {
    if (ship.length <= 1) {
      return (
        <svg width={35} height={35} viewBox="0 0 500 500" fill="none" opacity={0.6} style={{ transform: "translate(-0.5px)" }}>
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
        const rotateDeg = horizontal ? 90 : 0
        return (
          <svg width={35} height={35} viewBox="0 0 500 500" fill="none" opacity={0.6} style={{ transform: `translate(-0.5px) rotate(${rotateDeg}deg) scale(1, 1.1)` }}>
            <g viewBox="0 0 500 500">
              <line style={{ fill: 'rgb(216, 216, 216)', stroke: 'rgb(0, 0, 0)', strokeWidth: '42px' }} x1="77.6" y1="0" x2="77.4" y2="500"></line>
              <line style={{ fill: 'rgb(216, 216, 216)', stroke: 'rgb(0, 0, 0)', strokeWidth: '42px' }} x1="422.5" y1="0" x2="422.2" y2="500"></line>
            </g>
          </svg>
        )
      } else {
        const rotateDeg = horizontal ? 90 * (idx === 0 ? -1 : 1) : (idx === 0 ? 0 : 180);

        return (
          <svg width={35} height={35} viewBox="0 0 500 500" fill="none" opacity={0.6} style={{ transform: `translate(-0.5px) rotate(${rotateDeg}deg) scale(1, 1.1)` }}>
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

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "fit-content", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div>
          <div style={{ marginBottom: 8, display: "flex", width: "100%" }}>
            {myTurn && <p style={{ fontSize: 15, color: "forestgreen" }}>YOUR TURN</p>}
            <p style={{ fontSize: 15, flex: 1, textAlign: "right" }}>
              {!myTurn && <span>{turn.attacker.name}</span>}
              {!myTurn ? ` is ` : ""}Attacking 
              <span> {isAttacked ? "You" : turn.attacked.name}</span>
            </p>
          </div>
          <div style={{ border: "1px solid #008dff", borderWidth: "1px 0 0 1px", opacity: myTurn ? 1 : 0.6, cursor: myTurn ? "pointer" : "default" }}>
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} style={{ display: "flex", borderBottom: "1px solid #008dff", width: "fit-content" }}>
                {Array.from({ length: 10 }, (_, j) => {
                  const ship = getShip(i, j);
                  const isShipSunk = ship && ship.every(cell => turn.attacked.board[cell[0]][cell[1]])

                  return (
                    <div 
                      key={j} 
                      onClick={() => hitCell(i, j)}
                      style={{ width: 35, height: 35, borderRight: "1px solid #008dff", backgroundColor: "#b7dfff", display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}
                    >
                      {ship && (isAttacked || isShipSunk) && renderShipSegment(ship, i, j)}
                      {board[i][j] && (
                        <div 
                          style={{ position: "absolute", top: "50%", transform: "translate(0, -50%)", width: "45%", height: "45%", backgroundColor: getShip(i, j) ? "red" : "white", borderRadius: "50%", border: "1px solid #0007" }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
        {gameOver ? (
          <p style={{ color: "#800", fontSize: 18, fontWeight: "bold", textAlign: "center", marginTop: 16, fontStyle: "italic" }}>
            All SHIPS SUNK! {isAttacked ? "You are " : `${turn.attacked.name} has been `}eliminated.
          </p>
        ) : shotResult && (
          <>
            <p style={{ fontWeight: "bold", color: shotResult === "SHIP SUNK!" || shotResult === "HIT!" ? "red" : "#9cc", fontSize: 18, marginTop: 24, textAlign: "center", lineHeight: 1, fontStyle: "italic" }}>{shotResult}</p>
          </>
        )}
        {shotResult && (
           <p style={{ color: "#777" }}>
            {isNext ? "You are " : `${turn.next.name} is `}next...
          </p>
        )}
      </div>
    </div>
  )
}