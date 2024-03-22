import { useState, useRef, useEffect } from "react";
import { Stage, Layer, Line } from "react-konva"
import { FaEraser, FaPenClip } from "react-icons/fa6";
import socketClient from "./socketClient";

const wordBank = ["Apple", "Banana", "Car", "Dog", "Elephant", "Fish", "Guitar", "House", "Ice Cream", "Jupiter", "Kite", "Lion", "Moon", "Nest", "Octopus", "Penguin", "Queen", "Rocket", "Sun", "Tree", "Umbrella", "Violin", "Watermelon", "Xylophone", "Yacht", "Zebra", "Ant", "Basketball", "Cat", "Dolphin", "Eagle", "Fire", "Giraffe", "Helicopter", "Island", "Jellyfish", "Kangaroo", "Lemon", "Mountain", "Notebook", "Owl", "Piano", "Rocket", "Rabbit", "Spider", "Train", "Unicorn", "Violin", "Waterfall", "X-ray", "Yoyo", "Zookeeper"];
const ROUND_DURATION = 60;
const colors = ["black", "crimson", "gold", "mediumseagreen", "steelblue", "darkviolet"];
const strokeWidths = [5, 14, 21, 30];

export default function Pictionary({ connected, players }) {
  const [gameData, setGameData] = useState({ 
    word: "", 
    whoIsDrawing: 0, 
    canvasData: [], 
    correctGuessPlayerId: null
  });
  const [guess, setGuess] = useState("");
  const [penColor, setPenColor] = useState("black");
  const [penStrokeWidth, setPenStrokeWidth] = useState(5);
  const [startTime, setStartTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(ROUND_DURATION)
  const [tool, setTool] = useState('pen');
  const [text, setText] = useState("")
  const [timerEnded, setTimerEnded] = useState(false);

  const animationId = useRef();
  const isDrawing = useRef(false);

  const { word, whoIsDrawing, canvasData, correctGuessPlayerId } = gameData;

  const player = players.find(player => player.isMe);
  const connectedPlayer = players.find(player => !player.isDisconnected);
  const artist = players[whoIsDrawing];
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
      socketClient.subscribe("/topic/initGamePictionary", message => {
        if (connectedPlayer.isMe) {
          setGameData(JSON.parse(message.body));
          socketClient.publish({ destination: "/app/setTimer", body: ROUND_DURATION });
          setStartTime(new Date().getTime());
        }
      })

      socketClient.subscribe("/topic/updateGameDataPictionary", message => {
        if (!isDrawing.current)
          setGameData(JSON.parse(message.body));
      })

      socketClient.subscribe("/topic/timerEnded", () => {
        console.log("ENDED")
        setTimerEnded(true)
      })

      if (connectedPlayer.isMe)
        socketClient.publish({ destination: "/app/initGamePictionary" })
    }
  }, [connected])

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
    console.log(timeRemaining <= 0)
    if (connected && (correctGuessPlayer || timerEnded)) {
      setTimeout(() => {
        const newWord = wordBank[Math.floor(Math.random() * wordBank.length)];
        const newGameData = { 
          word: newWord, 
          whoIsDrawing: (whoIsDrawing + 1) % players.length, 
          canvasData: [], 
          correctGuessPlayerId: null 
        };
        
        if (connectedPlayer.isMe) {
          socketClient.publish({ 
            destination: "/app/updateGameDataPictionary", 
            body: JSON.stringify(newGameData) 
          });
          socketClient.publish({ destination: "/app/setTimer", body: ROUND_DURATION });
        }

        setStartTime(new Date().getTime());
        setTimerEnded(false);
        setGuess("");
      }, 3000)
    }
  }, [connected, correctGuessPlayer, timerEnded])

  function handleMouseDown(e) {
    if (artist.isMe) {
      isDrawing.current = true;
  
      const canvasData = gameData.canvasData.slice();
      const pos = e.target.getStage().getPointerPosition();
  
      canvasData.push({ 
        tool, 
        points: [pos.x, pos.y, pos.x, pos.y], 
        color: penColor, 
        strokeWidth: tool === "pen" ? penStrokeWidth : 30
      });
      
      updateGameData({ ...gameData, canvasData });
    }
  }

  function handleMouseMove(e) {
    if (isDrawing.current) {
      const canvasData = gameData.canvasData.slice();
      const last = canvasData.length - 1;
      const stage = e.target.getStage();
      const point = stage.getPointerPosition();

      canvasData[last] = { 
        ...canvasData[last],
        points: canvasData[last].points.concat([point.x, point.y]) 
      }; 
      
      updateGameData({ ...gameData, canvasData });
    }
  }

  function handleGuess(e) {
    e.preventDefault();
    setGuess(text);

    console.log(word)

    if (text.toLowerCase() === word.toLowerCase()) {
      socketClient.publish({ 
        destination: "/app/updateGameDataPictionary", 
        body: JSON.stringify({ ...gameData, correctGuessPlayerId: player.id })  
      });

      const newPlayers = players.slice();
      const correctGuessPlayerIdx = players.findIndex(p => p.id === player.id);

      newPlayers[whoIsDrawing] = { 
        ...newPlayers[whoIsDrawing], 
        ptsAwarded: newPlayers[whoIsDrawing].ptsAwarded + 1 
      };
      newPlayers[correctGuessPlayerIdx] = { 
        ...newPlayers[correctGuessPlayerIdx],
        ptsAwarded: newPlayers[correctGuessPlayerIdx].ptsAwarded + 1
      };

      socketClient.publish({ destination: "/app/updatePlayers", body: JSON.stringify(newPlayers) });
      setText("")
    }
  }

  function updateGameData(newGameData) {
    setGameData(newGameData);
    socketClient.publish({ 
      destination: "/app/updateGameDataPictionary",
      body: JSON.stringify(newGameData) 
    });
  }

  const isCorrect = guess && guess.toLowerCase() === word.toLowerCase();
  const isIncorrect = guess && guess.toLowerCase() !== word.toLowerCase();
  const inputColor = isCorrect ? "green" : isIncorrect ? "red" : "";
  const isRoundDone = correctGuessPlayer || isCorrect || timeRemaining <= 0;

  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%", padding: 16 }}>
      <div style={{ border: "1px solid lightgray", marginRight: 24, flexShrink: 0 }}>
        <Stage width={700} height={475} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}>
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
                globalCompositeOperation={
                  stroke.tool === 'eraser' ? 'destination-out' : 'source-over'
                }
              />
            ))}
          </Layer>
        </Stage>
        {artist.isMe && (
          <div style={{ display: "flex", alignItems: "center", borderTop: "1px solid lightgray", padding: 8 }}>
            <div style={{ border: "1px solid lightgray", borderRadius: 5, overflow: "hidden", display: "inline-flex", marginRight: 24 }}>
              <button onClick={() => setTool("pen")} style={{ paddingTop: 2, fontSize: 15, border: "none", borderRight: "1px solid lightgray", width: 36, backgroundColor: tool === "pen" ? "#28a745" : "transparent", color: tool === "pen" ? "white" : "black" }}>
                <FaPenClip />
              </button>
              <button onClick={() => setTool("eraser")} style={{ paddingTop: 2, fontSize: 15, border: "none", width: 36, backgroundColor: tool === "eraser" ? "#28a745" : "transparent", color: tool === "eraser" ? "white" : "black" }}>
                <FaEraser style={{ fontSize: 20, marginTop: 1 }} />
              </button>
            </div>
            <div style={{ display: "flex", gap: 4, marginRight: 24 }}>
              {colors.map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => setPenColor(color)}
                  style={{ width: 32, height: 27, backgroundColor: color, borderRadius: 3, border: "none", cursor: "pointer", opacity: penColor === color ? 1 : 0.35 }} 
                />
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {strokeWidths.map((width, idx) => (
                <button
                  key={idx}
                  onClick={() => setPenStrokeWidth(width)}
                  style={{ width: width + 5, height: width + 5, backgroundColor: penStrokeWidth === width ? penColor : "transparent", borderRadius: "50%", border: `1px solid ${penColor}`, cursor: "pointer", padding: 0 }} 
                />
              ))}
            </div>
            <button
              onClick={() => updateGameData({ ...gameData, canvasData: [] })}
              style={{ marginLeft: "auto", border: "1px solid lightgray", padding: "6px 8px", borderRadius: 5, fontSize: 15 }}
            >Clear</button>
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 320, flex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, textAlign: "center" }}>
          {artist.isMe ? (
            <>
              <p style={{ textAlign: "center", fontSize: 18 }}><span style={{ fontWeight: "bold", color: artist.color }}>You</span> are drawing:</p>
              <p style={{ textAlign: "center", fontSize: 32, fontWeight: "bold", textTransform: "capitalize", fontStyle: "italic" }}>{word}</p>
              {correctGuessPlayer && (
                <p style={{ textAlign: "center", fontSize: 18, marginTop: 16 }}>
                 <span style={{ fontWeight: "bold", color: correctGuessPlayer.color }}>{correctGuessPlayer.name}</span> guessed the word!
                </p>
              )}
            </>
          ) : (
            <>
              <div style={{ marginBottom: 24 }}>
                {correctGuessPlayer ? (
                  <p style={{ textAlign: "center", fontSize: 18 }}>
                    <span style={{ fontWeight: "bold", color: correctGuessPlayer.color }}>
                      {correctGuessPlayer.isMe ? "You" : correctGuessPlayer.name}
                    </span> guessed the word!
                  </p>
                ) : timeRemaining === 0 ? (
                  <p style={{ textAlign: "center", fontSize: 18, marginTop: 24 }}>
                    Out of Time! The word was:
                  </p>
                ) : (
                  <>
                    <p style={{ textAlign: "center", fontSize: 18, marginTop: 24 }}>{artist.name} is drawing...</p>
                    <p style={{ marginBottom: 16, fontSize: 15, color: "dimgray", fontWeight: "bold" }}>Be the first to correctly guess the drawing!</p>
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
                  style={{ 
                    display: "block", width: "100%", fontSize: 18, padding: 8, marginBottom: 8, boxSizing: "border-box", 
                    textAlign: "center", fontFamily: isRoundDone ? "monospace" : "",
                    border: `1px solid ${inputColor || "#cccccc"}`, color: inputColor, borderRadius: 5
                  }}
                  value={isRoundDone ? word.toUpperCase() : text}
                  disabled={isRoundDone}
                />
                <div style={{ display: "flex", alignItems: "center" }}>
                  <p style={{ textAlign: isCorrect ? "center" : "left", flex: 1 }}>
                    {isCorrect && <span style={{ fontWeight: "bold", color: "green" }}>Correct</span>}
                    {isIncorrect && <span style={{ fontWeight: "bold", color: "red" }}>Incorrect</span>}
                  </p>
                  {!isRoundDone && (
                    <button style={{ backgroundColor: "#28a745", padding: "6px 12px", color: "white", border: "none", fontSize: 15, borderRadius: 5 }}>Guess</button>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
        <p style={{ textAlign: "center", padding: 16, fontWeight: "bold" }}>
          {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}
        </p>
      </div>
    </div>
  )
}