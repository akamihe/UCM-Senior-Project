import { useState, useEffect } from "react";

const Game = () => {
  const [count, setCount] = useState(5);

  useEffect(() => {
    countDown(5);
  }, [])

  const countDown = (count) => {
    setCount(count)

    if (count > 0) {
      setTimeout(() => {
        countDown(count - 1);
      }, 1000);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}>
      <p style={{ textAlign: "center", fontSize: 32, fontWeight: "bold", marginBottom: 32 }}>Sudoku</p>
      <p style={{ textAlign: "center", color: "#0008", fontSize: 18 }}>
        Game starts in: <span style={{  fontWeight: "bold" }}>{count}</span>
      </p>
    </div>
  )
}

export default Game;