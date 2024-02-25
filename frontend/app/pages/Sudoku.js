import { useEffect, useMemo, useRef, useState } from "react";

function SudokuCell({ board, boardSolved, error, hidden, position, onClick, selected }) {
  const [row, col] = position;

  const value = board.grid[row][col];
  const correctValue = board.complete[row][col];
  const correct = value !== 0 && hidden && value === correctValue;
  const incorrect = value !== 0 && hidden && value !== correctValue;

  const style = {
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    position: "relative",
    width: 40, 
    height: 40, 
    border: "1px solid #0003",
    cursor: value !== correctValue ? "pointer" : "default",
    marginRight: col === 2 || col === 5 ? 8 : 0,
    borderBottomWidth: (row + 1) % 3 !== 0 ? 0 : 1,
    borderRightWidth: (col + 1) % 3 !== 0 ? 0 : 1,
    color: boardSolved ? "#0b0" : correct ? "#0b0" : incorrect ? "#fff" : "",
    backgroundColor: selected ? correct ? "#0b03" : incorrect ? "#f00" : "#eee": "#0000",
    borderColor: boardSolved ? "#0b0" : "#0003"
  };
  
  return (
    <div onClick={e => {e.stopPropagation(); onClick(row, col)}} style={style}>
      <>
        {value !== 0 && (
          <span style={{ fontSize: 32, fontWeight: "bold", textAlign: "center" }}>
            {value}
          </span>
        )}
        <div 
          style={{
            position: "absolute", 
            inset: 0,
            pointerEvents: "none",
            backgroundColor: error ? "#f001" : ""  
          }}
        />
      </>
    </div>
  )
}

const style = {
  container: { 
    display: "flex", 
    flexDirection: "column", 
    justifyContent: "center", 
    alignItems: "center", 
    outline: "none",
    flex: 1,
    width: "fit-content",
    margin: "auto"
  },
  boardContainer: { width: "fit-content", userSelect: "none", position: "relative" },
  instructionText: { marginBottom: 16, fontSize: 14 },
  gameFooter: { display: "flex", width: "100%", marginTop: 24, justifyContent: "center", alignItems: "center" },
  completionInfoContainer: { lineHeight: 1.15, flex: 1 },
  completedInText: { fontWeight: "bold", color: "#090", fontWeight: "bold" },
  waitingForOthersText: { fontSize: 18, fontWeight: "bold", fontSize: 14, color: "#0007" },
  timerText: { fontSize: 18, fontWeight: "bold" }
}

const Sudoku = ({ puzzle, onComplete }) => {
  const [board, setBoard] = useState(null);
  const [selectedCell, setSelectedCell] = useState([-1, -1]);
  const [timeRemaining, setTimeRemaining] = useState(300);

  const timeRemainingTimeout = useRef();

  const solved = useMemo(() => board && board.isSolved(), [board]);
  const errorCells = useMemo(() => {
    const rows = [];
    const cols = [];
    const subgrids = [];

    if (board) {
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {         
          const subRow = Math.floor(i / 3) * 3;
          const subCol = Math.floor(j / 3) * 3;

          for (let k = 0; k < 9; k++) {
            if (k !== j && board.grid[i][k] === board.grid[i][j])
              if (board.grid[i][k] !== 0 && !rows.includes(i))
                rows.push(i);

            if (k !== i && board.grid[k][j] === board.grid[i][j])
              if (board.grid[k][j] !== 0 && !cols.includes(j))
                cols.push(j);

            const row = subRow + Math.floor(k / 3);
            const col = subCol + k % 3;

            if ((row !== i || col !== j) && board.grid[row][col] === board.grid[i][j]) {
              const s = Math.floor(j / 3) + 3 * Math.floor(i / 3);
              
              if (board.grid[row][col] !== 0 && !subgrids.includes(s))
                subgrids.push(s);
            }
          }
        }
      }
    }

    return {rows, cols, subgrids};
  }, [board])

  const timeElapsed = 300 - timeRemaining;

  useEffect(() => {
    setBoard(puzzle.copy());
  }, [puzzle])

  useEffect(() => {
    if (solved) {
      setSelectedCell([-1, -1]);
      onComplete();
    }
  }, [solved])

  useEffect(() => {
    if (timeRemaining > 0) {
      if (solved) {
        clearTimeout(timeRemainingTimeout.current);
      } else {
        timeRemainingTimeout.current = setTimeout(() => {
          setTimeRemaining(timeRemaining - 1);
        }, 1000);
      }
    } else {
      onComplete();
    }
  }, [timeRemaining, solved])

  function clearCell(row, col) {
    setCellValue(row, col, 0);
  }

  function fillCell(row, col, value) {
    setCellValue(row, col, value);
  }

  function onCellClick(row, col) {
    if (!board.isCellSolved(row, col))
      setSelectedCell([row, col]);
  }

  function onKeyDown(e) {
    if (!solved) {
      const [row, col] = selectedCell;

      let newRow = row;
      let newCol = col;

      if (e.code === "ArrowUp" && row > 0)
        newRow -= 1;
      if (e.code === "ArrowDown" && row < 8)
        newRow += 1;
      if (e.code === "ArrowLeft" && col > 0)
        newCol -= 1;
      if (e.code === "ArrowRight" && col < 8)
        newCol += 1;

      if (newRow !== row || newCol !== col) {
        setSelectedCell(row === -1 || col === -1 ? [0, 0] : [newRow, newCol])
      } else if (row > -1 && col > -1) {
        if (!board.isCellSolved(row, col)) {
          const num = parseInt(e.key);
          
          if (!isNaN(num) && num !== 0)
            fillCell(row, col, num);
          else if (e.code === "Backspace" || e.code === "Delete")
            clearCell(row, col);
        }
      }
    }
  }

  const setCellValue = (row, col, value) => {
    board.grid[row][col] = value;
    setBoard(board.copy());
  }

  return (
    <div onKeyDown={onKeyDown} style={style.container} tabIndex={0}>
      <p style={style.instructionText}>Solve this Soduku puzzle as quickly as possible!</p>
      <div style={style.boardContainer}>
        {board && (
          <>
            <div style={{ pointerEvents: solved ? "none" : "auto" }}>
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} style={{ display: "flex", marginBottom: i === 2 || i === 5 ? 8 : 0 }}>
                  {Array.from({ length: 9 }, (_, j) => (
                    <SudokuCell
                      board={board}
                      error={
                        errorCells.rows.includes(i) || 
                        errorCells.cols.includes(j) ||
                        errorCells.subgrids.includes(Math.floor(j / 3) + 3 * Math.floor(i / 3))
                      }
                      key={j}
                      hidden={puzzle.grid[i][j] !== puzzle.complete[i][j]}
                      onClick={onCellClick}
                      position={[i, j]}
                      selected={i === selectedCell[0] && j === selectedCell[1]}
                      boardSolved={solved}
                    />
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div style={style.gameFooter}>
        {solved && (
          <div style={style.completionInfoContainer}>
            <p style={style.completedInText}>
              Completed in {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, "0")}
            </p>
            <p style={style.waitingForOthersText}>Waiting for other players to finish...</p>
          </div>
        )}
        <div>
          <span style={style.timerText}>
            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  )
}

export default Sudoku;