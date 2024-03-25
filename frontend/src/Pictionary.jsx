import { useState, useRef, useEffect } from "react";
import { Stage, Layer, Line, Circle } from "react-konva"
import { FaEraser, FaPenClip } from "react-icons/fa6";
import socketClient from "./socketClient";

const containerStyle = { display: "flex", justifyContent: "center", width: "100%", padding: 16 };
const boardSectionStyle = { border: "1px solid lightgray", marginRight: 24, flexShrink: 0 };
const boardBottomStyle = { 
  display: "flex", 
  alignItems: "center", 
  borderTop: "1px solid lightgray", 
  padding: 8 
};
const toolButtonsContainerStyle = { 
  border: "1px solid lightgray", 
  borderRadius: 5, 
  overflow: "hidden", 
  display: "inline-flex", 
  marginRight: 24 
};
const toolButtonStyle = (selected) => ({ 
  paddingTop: 2, 
  fontSize: 15, 
  border: "none", 
  borderRight: "1px solid lightgray", 
  width: 36, 
  cursor: "pointer",
  backgroundColor: selected ? "#28a745" : "transparent", 
  color: selected ? "white" : "black"
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

const wordBank = ["Apple", "Banana", "Car", "Dog", "Elephant", "Fish", "Guitar", "House", "Ice Cream", "Kite", "Lion", "Moon", "Noon", "Octopus", "Penguin", "Queen", "Rocket", "Saturn", "Sun", "Tree", "Umbrella", "Violin", "Watermelon", "Xylophone", "Yacht", "Zebra", "Ant", "Basketball", "Cat", "Dolphin", "Eagle", "Fire", "Giraffe", "Helicopter", "Island", "Jellyfish", "Kangaroo", "Lemon", "Mountain", "Notebook", "Owl", "Plane", "Piano", "Rocket", "Rabbit", "Spider", "Train", "Unicorn", "Violin", "Waterfall", "X-ray", "Yoyo"];
const ROUND_DURATION = 60;
const colors = ["black", "crimson", "gold", "mediumseagreen", "steelblue", "darkviolet"];
const strokeWidths = [5, 14, 21, 30];

export default function Pictionary({ connected, players }) {
  const [drawCursorCoords, setDrawCursorCoords] = useState(null);
  const [gameData, setGameData] = useState({ 
    word: "", 
    artist: -1, 
    canvasData: [], 
    correctGuessPlayerId: null,
    usedWords: [],
    finishedDrawing: []
  });
  const [guess, setGuess] = useState("");
  const [penColor, setPenColor] = useState("black");
  const [penStrokeWidth, setPenStrokeWidth] = useState(5);
  const [startTime, setStartTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(ROUND_DURATION)
  const [timerEnded, setTimerEnded] = useState(false);
  const [tool, setTool] = useState('pen');
  const [text, setText] = useState("");

  const animationId = useRef();
  const isDrawing = useRef(false);

  const { word, artist, canvasData, correctGuessPlayerId, usedWords, finishedDrawing } = gameData;

  const player = players.find(player => player.isMe);
  const connectedPlayer = players.find(player => !player.isDisconnected);
  const artistPlayer = players[artist];
  const correctGuessPlayer = players.find(player => player.id === correctGuessPlayerId);
  
  useEffect(() => {
    const handleMouseUp = () => {
      isDrawing.current = false;
    }
    
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [])
  
  useEffect(() => {
    if (connected) {
      socketClient.publish({ destination: "/app/cancelTimer" });

      socketClient.subscribe("/topic/pictionaryInitGame", message => {
        setGameData(JSON.parse(message.body));
      })

      socketClient.subscribe("/topic/pictionaryUpdateGame", message => {
        if (!isDrawing.current)
          setGameData(JSON.parse(message.body));
      })

      socketClient.subscribe("/topic/timerEnded", () => setTimerEnded(true));

      const word = wordBank[Math.floor(Math.random() * wordBank.length)];

      if (connectedPlayer.isMe)
        socketClient.publish({ destination: "/app/pictionaryInitGame", body: word });

      return () => {
        socketClient.unsubscribe("/topic/pictionaryInitGame");
        socketClient.unsubscribe("/topic/pictionaryUpdateGame");
        socketClient.unsubscribe("/topic/timerEnded");
      }
    }
  }, [connected])

  useEffect(() => {
    if (connected) {
      const subscription = socketClient.subscribe("/topic/playerDisconnected", message => {
        const newPlayers = JSON.parse(message.body);
        const newGameData = { 
          ...gameData, 
          artist: getNextConnectedPlayerIdx(newPlayers, artist), 
          canvasData: [],
          finishedDrawing: finishedDrawing.map((item, idx) => {
            return newPlayers[idx].isDisconnected ? true : item
          })
        };
        
        socketClient.publish({ destination: "/app/cancelTimer" });
        socketClient.publish({ 
          destination: "/app/pictionaryUpdateGame", 
          body: JSON.stringify(newGameData) 
        });
      });

      return () => subscription.unsubscribe();
    }
  }, [connected, artist, gameData])

  useEffect(() => {
    if (artist >= 0) {
      if (connectedPlayer.isMe)
        socketClient.publish({ destination: "/app/setTimer", body: ROUND_DURATION });
      
      setStartTime(new Date().getTime());
      setTimerEnded(false);
    }
  }, [artist])

  useEffect(() => {
    if (startTime) { 
      const updateTimeRemaining = () => {
        const elapsed = Math.floor((new Date().getTime() - startTime) / 1000);
        setTimeRemaining(Math.max(0, ROUND_DURATION - elapsed));
        
        if (!correctGuessPlayer && elapsed < ROUND_DURATION)
          animationId.current = requestAnimationFrame(updateTimeRemaining);
      };
      updateTimeRemaining();
    }

    return () => cancelAnimationFrame(animationId.current);
  }, [startTime, correctGuessPlayer]);

  useEffect(() => {
    if (connected && (correctGuessPlayer || timerEnded)) {
      isDrawing.current = false;

      setTimeout(() => {
        if (connectedPlayer.isMe) {
          const newFinishedDrawing = finishedDrawing.slice();
          const newUsedWords = [...usedWords, word];
          let newWord = wordBank[Math.floor(Math.random() * wordBank.length)];

          while (newUsedWords.includes(newWord))
            newWord = wordBank[Math.floor(Math.random() * wordBank.length)];

          newFinishedDrawing[artist] = true;
          
          const newGameData = { 
            word: newWord, 
            artist: getNextConnectedPlayerIdx(players, (artist + 1) % players.length), 
            canvasData: [], 
            correctGuessPlayerId: null,
            usedWords: newUsedWords,
            finishedDrawing: newFinishedDrawing
          };

          socketClient.publish({ destination: "/app/cancelTimer" });

          if (newFinishedDrawing.every(finished => finished)) {
            socketClient.publish({ destination: "/app/endGame" });
          } else {
            socketClient.publish({ 
              destination: "/app/pictionaryUpdateGame", 
              body: JSON.stringify(newGameData) 
            });
          }
        }

        setText("");
        setGuess("");
      }, 3000);
    }
  }, [connected, !!correctGuessPlayer, timerEnded])

  function getNextConnectedPlayerIdx(players, current) {
    const last = (players.length + (current - 1)) % players.length;
    let idx = current;

    while (players[idx].isDisconnected && idx !== last)
      idx = (idx + 1) % players.length;

    return idx;
  }

  function handleGuess(e) {
    e.preventDefault();
    setGuess(text);

    if (text.toLowerCase() === word.toLowerCase()) {
      const newPlayers = players.slice();
      const correctGuessPlayerIdx = players.findIndex(p => p.id === player.id);

      newPlayers[artist] = { 
        ...newPlayers[artist], 
        ptsAwarded: newPlayers[artist].ptsAwarded + 1 
      };
      newPlayers[correctGuessPlayerIdx] = { 
        ...newPlayers[correctGuessPlayerIdx],
        ptsAwarded: newPlayers[correctGuessPlayerIdx].ptsAwarded + 1
      };

      socketClient.publish({ 
        destination: "/app/pictionaryUpdateGame", 
        body: JSON.stringify({ ...gameData, correctGuessPlayerId: player.id })  
      });
      socketClient.publish({ destination: "/app/updatePlayers", body: JSON.stringify(newPlayers) });
    }
  }

  function handleMouseDown(e) {
    if (artistPlayer.isMe && !correctGuessPlayer && !timerEnded) {
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
    
    if (artistPlayer?.isMe)
      setDrawCursorCoords([point.x, point.y]);
  }

  function updateCanvasData(canvasData) {
    const newGameData = { ...gameData, canvasData };
    setGameData(newGameData);
    socketClient.publish({ 
      destination: "/app/pictionaryUpdateGame",
      body: JSON.stringify(newGameData) 
    });
  }

  const isCorrect = guess && guess.toLowerCase() === word.toLowerCase();
  const isIncorrect = guess && guess.toLowerCase() !== word.toLowerCase();
  const inputColor = isCorrect ? "green" : isIncorrect ? "red" : "";
  const isRoundDone = correctGuessPlayer || isCorrect || timeRemaining <= 0;

  return (
    <div style={containerStyle}>
      <div style={boardSectionStyle}>
        <Stage 
          width={700} 
          height={475} 
          onMouseDown={handleMouseDown} 
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setDrawCursorCoords(null)}
          style={{ cursor: artistPlayer?.isMe ? "none" : "default" }}
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
        {artistPlayer?.isMe && (
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
          {artistPlayer?.isMe ? (
            <>
              <p style={infoTextStyle}><span style={playerTextStyle(artistPlayer.color)}>You</span> are drawing:</p>
              <p style={wordStyle}>{word}</p>
              {correctGuessPlayer && (
                <p style={{ ...infoTextStyle, marginTop: 16 }}>
                  <span style={playerTextStyle(artistPlayer.color)}>{correctGuessPlayer.name}</span>
                  {" "}guessed the word!
                </p>
              )}
            </>
          ) : (
            <>
              <div style={{ marginBottom: 24 }}>
                {correctGuessPlayer ? (
                  <p style={infoTextStyle}>
                    <span style={playerTextStyle(artistPlayer.color)}>
                      {correctGuessPlayer.isMe ? "You" : correctGuessPlayer.name}
                    </span> guessed the word!
                  </p>
                ) : timerEnded ? (
                  <p style={{ ...infoTextStyle, marginTop: 24 }}>Out of Time! The word was:</p>
                ) : (
                  <>
                    <p style={{ ...infoTextStyle, marginTop: 24 }}>
                      <span style={playerTextStyle(artistPlayer?.color)}>{artistPlayer?.name}</span> is drawing...
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
                  {!isRoundDone && <button style={guessButtonStyle}>Guess</button>}
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