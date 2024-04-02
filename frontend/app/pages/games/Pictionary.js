import { useState, useRef, useEffect } from "react";
import { Stage, Layer, Line, Circle } from "react-konva"
import { FaEraser, FaPenClip } from "react-icons/fa6";

const containerStyle = { display: "flex", justifyContent: "center", width: "100%", padding: 16 };
const boardSectionStyle = { border: "1px solid lightgray", marginRight: 24, flexShrink: 0 };
const boardBottomStyle = { display: "flex", alignItems: "center", borderTop: "1px solid lightgray", padding: 8 };
const toolButtonsContainerStyle = { 
  border: "1px solid lightgray", 
  borderRadius: 5, 
  overflow: "hidden", 
  display: "inline-flex", 
  marginRight: 24 
};
const toolButtonStyle = (selected) => ({ 
  fontSize: 15, 
  border: "none", 
  borderRight: "1px solid lightgray", 
  width: 40, 
  cursor: "pointer",
  backgroundColor: selected ? "#28a745" : "transparent", 
  color: selected ? "white" : "black",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "3px 0"
})
const colorButtonsContainerStyle = { display: "flex", gap: 4, marginRight: 24 };
const colorButtonStyle = (color, penColor) => ({ 
  width: 32, 
  height: 27, 
  backgroundColor: color, 
  borderRadius: 3, 
  border: "none", 
  cursor: "pointer", 
  opacity: penColor === color ? 1 : 0.35 
})
const strokeWidthButtonsContainerStyle = { display: "flex", alignItems: "center", gap: 4 };
const strokeWidthButtonStyle = (size, penStrokeWidth, penColor) => ({ 
  width: size + 5, 
  height: size + 5, 
  backgroundColor: penStrokeWidth === size ? penColor : "transparent", 
  borderRadius: "50%", 
  border: `1px solid ${penColor}`, 
  cursor: "pointer", 
  padding: 0 
})
const clearButtonStyle = { 
  marginLeft: "auto", 
  border: "1px solid lightgray", 
  padding: "6px 8px", 
  borderRadius: 5, 
  fontSize: 15 
}
const rightSectionStyle = { 
  display: "flex", 
  flexDirection: "column", 
  justifyContent: "center", 
  maxWidth: 320, 
  flex: 1 
}
const rightSectionTopStyle = { 
  display: "flex", 
  flexDirection: "column", 
  justifyContent: "center", 
  flex: 1, 
  textAlign: "center" 
}
const playerTextStyle = (color) => ({ fontWeight: "bold", color });
const wordStyle = { textAlign: "center", fontSize: 32, fontWeight: "bold", fontStyle: "italic" };
const infoTextStyle = { textAlign: "center", fontSize: 18 };
const infoText2Style = { fontSize: 15, color: "dimgray", fontWeight: "bold" };
const guessInputStyle = (color, roundDone) => ({
  display: "block", 
  width: "100%", 
  fontSize: 18, 
  padding: 8, 
  marginBottom: 8, 
  boxSizing: "border-box", 
  textAlign: "center",
  fontFamily: roundDone ? "monospace" : "",
  border: `1px solid ${color || "#cccccc"}`, 
  color, 
  borderRadius: 5
})
const timerTextStyle = { textAlign: "center", padding: 16, fontWeight: "bold" };
const guessButtonStyle = { 
  backgroundColor: "#28a745", 
  padding: "6px 12px", 
  color: "white", 
  border: "none", 
  fontSize: 15, 
  borderRadius: 5 
};

const ROUND_DURATION = 60;
const colors = ["black", "crimson", "gold", "mediumseagreen", "steelblue", "darkviolet"];
const strokeWidths = [5, 14, 21, 30];

export default function Pictionary({ socket, gameState }) {
  const [drawCursorCoords, setDrawCursorCoords] = useState(null);
  const [gameData, setGameData] = useState({ 
    word: "", 
    artist: -1, 
    canvasData: [], 
    correctGuessPlayerId: null,
    usedWords: [],
    finishedDrawing: [false]
  });
  const [guess, setGuess] = useState("");
  const [penColor, setPenColor] = useState("black");
  const [penStrokeWidth, setPenStrokeWidth] = useState(5);
  const [startTime, setStartTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(ROUND_DURATION);
  const [timerEnded, setTimerEnded] = useState(false);
  const [tool, setTool] = useState('pen');
  const [text, setText] = useState("");

  const animationId = useRef();
  const isDrawing = useRef(false);

  const { word, artist, canvasData, correctGuessPlayerId, finishedDrawing } = gameData;

  const artistUser = gameState.users[artist];
  const correctGuessUser = gameState.users.find(user => user.id === correctGuessPlayerId);

  const isCorrect = guess && guess.toLowerCase() === word.toLowerCase() || correctGuessUser?.isMe;
  const isIncorrect = guess && guess.toLowerCase() !== word.toLowerCase();
  const inputColor = isCorrect ? "green" : isIncorrect ? "red" : "";
  const isRoundDone = correctGuessUser || isCorrect || timeRemaining <= 0;
  
  useEffect(() => {
    const handleMouseUp = () => {
      isDrawing.current = false;
    }
    
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [])

  useEffect(() => {
    socket.subscribe("/game/pictionaryInitGame", data => {
      if (data) setGameData(data);
    });
    socket.subscribe("/game/pictionaryUpdateGame", data => {
      if (!isDrawing.current || data.correctGuessPlayerId)
        setGameData(data);
    });
    socket.subscribe("/broker/timerEnded", () => setTimerEnded(true));

    socket.pictionaryInitGame();
  }, [])

  useEffect(() => {
    if (artist >= 0) {
      if (gameState.users[0].isMe)
        socket.startTimer(ROUND_DURATION);

      setStartTime(new Date().getTime());
      setTimerEnded(false);
    }
  }, [artist])

  useEffect(() => {
    if (startTime) { 
      const updateTimeRemaining = () => {
        const elapsed = Math.floor((new Date().getTime() - startTime) / 1000);
        setTimeRemaining(Math.max(0, ROUND_DURATION - elapsed));
        
        if (!correctGuessUser && elapsed < ROUND_DURATION)
          animationId.current = requestAnimationFrame(updateTimeRemaining);
      };
      updateTimeRemaining();
    }

    return () => cancelAnimationFrame(animationId.current);
  }, [startTime, correctGuessUser]);

  useEffect(() => {
    if (timerEnded || correctGuessUser) {
      isDrawing.current = false;
      setGuess("");
      setText("");
    }
    if (timerEnded && gameState.users[0].isMe)
      socket.pictionaryEndTurn();
  }, [timerEnded, correctGuessUser])

  useEffect(() => {
    if (finishedDrawing.every(bool => bool) && gameState.users[0].isMe)
      socket.endGame();
  }, [finishedDrawing])

  useEffect(() => {
    console.log(gameData);
  }, [gameData])

  function handleGuess(e) {
    e.preventDefault();
    setGuess(text);

    if (text.toLowerCase() === word.toLowerCase())
      socket.pictionaryCorrectGuess();
  }

  function handleMouseDown(e) {
    if (artistUser.isMe && !correctGuessUser && !timerEnded) {
      isDrawing.current = true;
  
      const canvasData = gameData.canvasData.slice();
      const pos = e.target.getStage().getPointerPosition();
  
      canvasData.push({ 
        tool, 
        points: [pos.x, pos.y, pos.x, pos.y], 
        color: penColor, 
        strokeWidth: tool === "pen" ? penStrokeWidth : 30
      });
      
      updateCanvasData(canvasData);
    }
  }

  function handleMouseMove(e) {
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    if (isDrawing.current) {
      const canvasData = gameData.canvasData.slice();
      const last = canvasData.length - 1;

      canvasData[last] = { 
        ...canvasData[last],
        points: canvasData[last].points.concat([point.x, point.y]) 
      }; 

      updateCanvasData(canvasData);
    }
    
    if (artistUser?.isMe)
      setDrawCursorCoords([point.x, point.y]);
  }

  function updateCanvasData(canvasData) {
    const newGameData = { ...gameData, canvasData };
    setGameData(newGameData);
    socket.pictionaryUpdateCanvasData(canvasData);
  }

  return (
    <div style={containerStyle}>
      <div style={boardSectionStyle}>
        <Stage 
          width={700} 
          height={475} 
          onMouseDown={handleMouseDown} 
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setDrawCursorCoords(null)}
          style={{ cursor: artistUser?.isMe ? "none" : "default" }}
        >
          <Layer>
            {canvasData.map((stroke, i) => (
              <Line
                key={i}
                points={stroke.points}
                stroke={stroke.color}
                strokeWidth={stroke.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={stroke.tool === 'eraser' ? 'destination-out' : 'source-over'}
              />
            ))}
            {drawCursorCoords && (
              <Circle 
                width={tool === "pen" ? penStrokeWidth + 5 : 30} 
                height={tool === "pen" ? penStrokeWidth + 5 : 30} 
                stroke="lightgray"
                x={drawCursorCoords[0]}
                y={drawCursorCoords[1]}
              />
            )}
          </Layer>
        </Stage>
        {artistUser?.isMe && (
          <div style={boardBottomStyle}>
            <div style={toolButtonsContainerStyle}>
              <button onClick={() => setTool("pen")} style={toolButtonStyle(tool === "pen")}>
                <FaPenClip />
              </button>
              <button onClick={() => setTool("eraser")} style={toolButtonStyle(tool === "eraser")}>
                <FaEraser style={{ fontSize: 20, marginTop: 1 }} />
              </button>
            </div>
            <div style={colorButtonsContainerStyle}>
              {colors.map((color, idx) => (
                <button key={idx} onClick={() => setPenColor(color)} style={colorButtonStyle(color, penColor)} />
              ))}
            </div>
            <div style={strokeWidthButtonsContainerStyle}>
              {strokeWidths.map((width, idx) => (
                <button
                  key={idx}
                  onClick={() => setPenStrokeWidth(width)}
                  style={strokeWidthButtonStyle(width, penStrokeWidth, penColor)} 
                />
              ))}
            </div>
            <button onClick={() => updateCanvasData([])} style={clearButtonStyle}>Clear</button>
          </div>
        )}
      </div>
      <div style={rightSectionStyle}>
        <div style={rightSectionTopStyle}>
          {artistUser?.isMe ? (
            <>
              <p style={infoTextStyle}>
                <span style={playerTextStyle(artistUser.color)}>You</span> are drawing:
              </p>
              <p style={wordStyle}>{word}</p>
              {correctGuessUser && (
                <p style={{ ...infoTextStyle, marginTop: 16 }}>
                  <span style={playerTextStyle(correctGuessUser.color)}>
                    {correctGuessUser.username}
                  </span>{" "}guessed the word!
                </p>
              )}
            </>
          ) : (
            <>
              <div style={{ marginBottom: 24 }}>
                {correctGuessUser ? (
                  <p style={infoTextStyle}>
                    <span style={playerTextStyle(correctGuessUser.color)}>
                      {correctGuessUser.isMe ? "You" : correctGuessUser.username}
                    </span> guessed the word!
                  </p>
                ) : timerEnded ? (
                  <p style={{ ...infoTextStyle, marginTop: 24 }}>Out of Time! The word was:</p>
                ) : (
                  <>
                    <p style={{ ...infoTextStyle, marginTop: 24 }}>
                      <span style={playerTextStyle(artistUser?.color)}>
                        {artistUser?.username}
                      </span> is drawing...
                    </p>
                    <p style={{ marginBottom: 16, ...infoText2Style }}>
                      Be the first to correctly guess the drawing!
                    </p>
                  </>
                )}
              </div>
              <form onSubmit={handleGuess}>
                <input 
                  onChange={e => {
                    setText(e.target.value); 
                    if (!isCorrect) 
                      setGuess("")
                  }}
                  placeholder="Type your guess" 
                  style={guessInputStyle(inputColor, isRoundDone)}
                  value={isRoundDone ? word.toUpperCase() : text}
                  disabled={isRoundDone}
                />
                <div style={{ display: "flex", alignItems: "center" }}>
                  <p style={{ textAlign: isCorrect ? "center" : "left", flex: 1 }}>
                    {isCorrect && <span style={{ fontWeight: "bold", color: "green" }}>Correct</span>}
                    {isIncorrect && <span style={{ fontWeight: "bold", color: "red" }}>Incorrect</span>}
                  </p>
                  {!isRoundDone && <button id="guess" style={guessButtonStyle}>Guess</button>}
                </div>
              </form>
            </>
          )}
        </div>
        <p style={timerTextStyle}>
          {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}
        </p>
      </div>
    </div>
  )
}
