import { useState, useEffect } from "react";
import socketClient from "./socketClient"

const style = {
  contentContainer: { display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" },
  playersCodeContainer: { display: "flex", flex: 1, justifyContent: "center", maxHeight: 350 },
  playersSection: { display: "flex", flexDirection: "column", marginRight: 48, height: "100%" },
  numPlayersText: { width: 350, fontSize: 18, fontWeight: "bold", textAlign: "center", margin: "auto" },
  playersList: { display: "flex", flexDirection: "column", gap: 8, justifyContent: "center", flex: 1 },
  playersListItem: (color) => ({
    border: `1px solid ${color}`, 
    backgroundColor: color + "11",
    padding: "8px 12px", 
    borderRadius: 8, 
    width: 350,
    position: "relative"
  }),
  playersListItemNum: { color: "#0008", fontSize: 18, marginRight: 12 },
  playersListItemYouText: (color) => ({
    position: "absolute", 
    right: 8, 
    top: 12, 
    fontWeight: "bold", 
    backgroundColor: color, 
    color: "#fff", 
    fontSize: 13, 
    padding: "0px 8px", 
    borderRadius: 16
  }),
  codeSection: { display: "flex", flexDirection: "column", height: "100%" },
  codeTextContainer: { flex: 1, display: "flex", alignItems: "center" },
  startGameBtn: (disabled) => ({ 
    backgroundColor: disabled ? "rgb(128, 128, 128)" : "#28a745", 
    color: "white", 
    fontSize: 20,
    fontWeight: "bold", 
    padding: "8px 16px", 
    borderRadius: 8,
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? "none" : "auto",
    border: "none"
  }),
  requirementText: { marginTop: 16, fontSize: 15, color: "dimgray" }
}

const MAX_PLAYERS = 5;

export default function WaitingRoom({ connected, players }) {
  const [code, setCode] = useState();

  const player = players.find(player => player.isMe);
  const connectedPlayers = players.filter(player => !player.isDisconnected);
  const isNotInGame = players.length > 0 && !player;

  useEffect(() => {
    if (connected) {
      socketClient.subscribe("/topic/gameCode", message => {
        setCode(JSON.parse(message.body))
      });
      socketClient.publish({ destination: "/app/gameCode" });
    }
  }, [connected])

  function startGames() {
    socketClient.publish({ destination: "/app/startGames" });
  }

  return (
    <div style={style.contentContainer}>
      <div style={style.playersCodeContainer}>
        {!isNotInGame && (
          <div style={style.playersSection}>
            <p style={style.numPlayersText}>{connectedPlayers.length} Players</p>
            <div style={style.playersList}>
              {connectedPlayers.map((player, idx) => (
                <div key={idx} style={style.playersListItem(player.color)}>
                  <span style={style.playersListItemNum}>{idx + 1}</span>
                  {player.name}
                  {player.isMe && (
                    <span style={style.playersListItemYouText(player.color)}>You</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={style.codeSection}>
          <p style={{ textAlign: "center", fontSize: 18, fontWeight: "bold" }}>Game Code: </p>
          <div style={style.codeTextContainer}>
            <h1 style={{ letterSpacing: 25, fontSize: 108, marginLeft: 28 }}>{code}</h1>
          </div>
        </div>
      </div>
      {player && player.isHost ? (
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <button onClick={startGames} style={style.startGameBtn(players.length < 2)}>
            Start the Games
          </button>
          {players.length < 2 && (
            <p style={style.requirementText}>At least one other player must join to start</p>
          )}
        </div>
      ) : (
        <p style={{ textAlign: "center", fontSize: 18 }}>
          {isNotInGame 
            ? players.length === MAX_PLAYERS ? "Game is full" : "Game In Progress..." 
            : "Waiting for host to start the game..."}
        </p>
      )}
    </div>
  )
}