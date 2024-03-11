import { useState } from "react";

const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const ships = [
  [ [0, 3], [0, 4], [0, 5] ],
  [ [3, 1], [4, 1], [5, 1] ],
  [ [5, 8] ],
  [ [8, 4], [8, 5] ]
];

export default function Battleship() {
  const [shots, setShots] = useState(new Array(10).fill(new Array(10).fill(false)));
  const [shotResult, setShotResult] = useState("");

  const gameOver = ships.every(ship => ship.every(cell => shots[cell[0]][cell[1]]));

  function hitCell(i, j) {
    if (!shots[i][j]) {
      const newShots = shots.map(row => row.slice());
      newShots[i][j] = true;
      
      const ship = getShip(i, j);
      
      if (ship) {
        const isShipSunk = ship.every(cell => newShots[cell[0]][cell[1]]);
        setShotResult(isShipSunk ? "SHIP SUNK!" : "HIT!");
      } else {
        setShotResult("MISS");
      }

      setShots(newShots);
    }
  }

  function getShip(i, j) {
    for (const ship of ships) {
      for (const cell of ship) {
        if (cell[0] === i && cell[1] === j)
          return ship;
      }
    }

    return null;
  }

  return (
    <div style={{ width: "fit-content" }}>
      <div style={{ border: "1px solid #000", borderWidth: "1px 0 0 1px" }}>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} style={{ display: "flex", borderBottom: "1px solid #000", width: "fit-content" }}>
            {Array.from({ length: 10 }, (_, j) => (
              <div 
                key={j} 
                onClick={() => hitCell(i, j)}
                style={{ width: 45, height: 45, borderRight: "1px solid #000", backgroundColor: "skyblue", display: "flex", justifyContent: "center", alignItems: "center" }}
              >
                {shots[i][j] && (
                  <div 
                    style={{ width: "50%", height: "50%", backgroundColor: getShip(i, j) ? "red" : "white", borderRadius: "50%" }}
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      {gameOver ? (
        <p style={{ color: "#c8aa04", fontSize: 18, fontWeight: "bold", textAlign: "center", marginTop: 16 }}>All ships sunk! Player has been eliminated.</p>
      ) : shotResult && (
        <p style={{ fontWeight: "bold", color: shotResult === "SHIP SUNK!" || shotResult === "HIT!" ? "red" : "forestgreen", fontSize: 18, marginTop: 24, textAlign: "center" }}>{shotResult}</p>
      )}
    </div>
  )
}