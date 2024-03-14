import { useEffect, useMemo, useRef, useState } from "react";
import SudokuPuzzle from "./SudokuPuzzle";
import MultiScreens from "./../components/MultiScreens"

const style = {
  gameInstanceRow: { display: "flex", flex: 1, height: "50%" },
  gameInstanceCellL: { flex: 1, height: "100%", borderRight: "1px solid #0002" },
  gameInstanceCellR: { flex: 1, height: "100%" },
  gameInstanceContent: { transform: "scale(0.6)", transformOrigin: "top", paddingTop: 8 },
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

export default function Sudoku({ players, onSetPlayer, onGameComplete }) {
  const sudokuPuzzle = useMemo(() => {
    return SudokuPuzzle.generatePuzzle();
  }, []) // At the beginning generate a puzzle for all players to use

  useEffect(() => {
    if (players.every(player => player.done))
      onGameComplete();
  }, [players]) // watch for changes to player data and check if all players are done

  function markPlayerAsDone(idx) {
    // more points are awarded for players that finish earlier
    const ptsAwarded = 3 - (players.filter(player => player.done).length);
    onSetPlayer({ ...players[idx], done: true, ptsAwarded });
  }

  return (
    <MultiScreens 
      instances={players.map((_, idx) => ( // create instance for each player
        <SudokuInstance puzzle={sudokuPuzzle} onComplete={() => markPlayerAsDone(idx)} />
      ))} 
    />
  );
}

function SudokuInstance({ puzzle, onComplete }) {
  const [board, setBoard] = useState(null);
  const [selectedCell, setSelectedCell] = useState([-1, -1]);
  const [timeRemaining, setTimeRemaining] = useState(300); // five minutes to solve the board

  const timeRemainingTimeout = useRef();

  const solved = useMemo(() => board && board.isSolved(), [board]);
  const errorCells = useMemo(() => {
    const rows = [];
    const cols = [];
    const subgrids = [];

    if (board) {
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) { // for each cell...       
          const subRow = Math.floor(i / 3) * 3;
          const subCol = Math.floor(j / 3) * 3;

          for (let k = 0; k < 9; k++) {
            if (k !== j && board.grid[i][k] === board.grid[i][j])
              // detect rows that contain duplicate numbers
              if (board.grid[i][k] !== 0 && !rows.includes(i)) 
                rows.push(i); 

            if (k !== i && board.grid[k][j] === board.grid[i][j])
              // detect columns that contain duplicate numbers
              if (board.grid[k][j] !== 0 && !cols.includes(j)) 
                cols.push(j);

            const row = subRow + Math.floor(k / 3);
            const col = subCol + k % 3;

            if ((row !== i || col !== j) && board.grid[row][col] === board.grid[i][j]) {
              // subgrid of 0 = top left to subgrid of 8 = bottom right
              const subgrid = Math.floor(j / 3) + 3 * Math.floor(i / 3);
              
              // detect subgrids that contain duplicate numbers
              if (board.grid[row][col] !== 0 && !subgrids.includes(subgrid)) 
                subgrids.push(subgrid);
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
  }, [puzzle]) // once the puzzle data is loaded, set board state to a copy of the puzzle 

  useEffect(() => {
    if (solved) {
      setSelectedCell([-1, -1]);
      onComplete();
    }
  }, [solved]) // watch for when the board becomes solved and mark as complete

  useEffect(() => { // executes every time timeRemaining is updated (every second)
    if (timeRemaining > 0) {
      if (solved) {
        clearTimeout(timeRemainingTimeout.current); // if board is solved, stop 
      } else {
        timeRemainingTimeout.current = setTimeout(() => {
          setTimeRemaining(timeRemaining - 1);
        }, 1000);
      }
    } else {
      onComplete(); // if time runs out, mark as complete
    }
  }, [timeRemaining, solved])

  function clearCell(row, col) {
    setCellValue(row, col, 0); // cell value of zero means empty cell
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

      // shift cell selection up/down/right/left based the arrow key pressed
      if (e.code === "ArrowUp" && row > 0)
        newRow -= 1;
      if (e.code === "ArrowDown" && row < 8)
        newRow += 1;
      if (e.code === "ArrowLeft" && col > 0)
        newCol -= 1;
      if (e.code === "ArrowRight" && col < 8)
        newCol += 1;

      if (newRow !== row || newCol !== col) { // if cell selection changed via arrow keys...
        setSelectedCell(row === -1 || col === -1 ? [0, 0] : [newRow, newCol])
      } else if (row > -1 && col > -1) {
        if (!board.isCellSolved(row, col)) {
          const num = parseInt(e.key);
          
          // allows cell to be filled with the number key that was pressed
          if (!isNaN(num) && num !== 0) 
            fillCell(row, col, num);
          // clear cell upon pressing backspace or delete
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
                      boardSolved={solved}
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

function SudokuCell({ board, boardSolved, error, hidden, position, onClick, selected }) {
  const [row, col] = position;

  const value = board.grid[row][col];
  const correctValue = board.complete[row][col];
  // cell is correctly guessed if the number entered by the user at (row, col) is
  // equal to the number at (row, col) of the completed puzzle
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