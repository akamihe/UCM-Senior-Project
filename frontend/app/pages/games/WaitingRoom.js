const style = {
  container: { display: "flex", flexDirection: "column", height: "100%", padding: 16 },
  contentContainer: {
    display: "flex", 
    flexDirection: "column", 
    flex: 1, 
    justifyContent: "center"
  },
  playersCodeContainer: { display: "flex", flex: 1, justifyContent: "center", maxHeight: 350 },
  playersSection: { display: "flex", flexDirection: "column", marginRight: 48, height: "100%" },
  numPlayersText: { width: 350, fontSize: 18, fontWeight: "bold", textAlign: "center" },
  playersList: { 
    display: "flex", 
    flexDirection: "column", 
    gap: 8, 
    justifyContent: "center", 
    flex: 1
  },
  playersListItem: (color) => ({
    border: `1px solid ${color}`, 
    backgroundColor: color + "11",
    padding: "8px 8px", 
    borderRadius: 8, 
    width: 350,
    position: "relative"
  }),
  playersListItemNum: { color: "#0008", fontSize: 18, marginRight: 12 },
  playersListItemYouText: (clr) => ({
    position: "absolute", 
    right: 8, 
    top: 12, 
    fontWeight: "bold", 
    backgroundColor: clr, 
    color: "#fff", 
    fontSize: 13, 
    padding: "0px 8px", 
    borderRadius: 16
  }),
  codeSection: { display: "flex", flexDirection: "column", height: "100%" },
  codeTextContainer: { flex: 1, display: "flex", alignItems: "center" },
  startGameBtn: { 
    backgroundColor: "#28a745", 
    color: "white", 
    fontSize: 20,
    fontWeight: "bold", 
    padding: "8px 16px", 
    borderRadius: 8
  }
}

export default function WaitingRoom({ socket, gameState }) {
  const isHost = gameState.users.find(user => user.gameMaster)?.isMe;

  return (
    <div style={style.container}>
      <div style={style.contentContainer}>
        <div style={style.playersCodeContainer}>
          <div style={style.playersSection}>
            <p style={style.numPlayersText}>{gameState.users.length} Players</p>
            <div style={style.playersList}>
              {gameState.users.map((user, idx) => (
                <div key={idx} style={style.playersListItem(user.color)}>
                  <span style={style.playersListItemNum}>{idx + 1}</span>
                  {user.username}
                  {user.isMe && <span style={style.playersListItemYouText(user.color)}>You</span>}
                </div>
              ))}
            </div>
          </div>
          <div style={style.codeSection}>
            <p style={{ textAlign: "center" }}>Game code: </p>
            <div style={style.codeTextContainer}>
              <h1 style={{ letterSpacing: 16, fontSize: 108 }}>{gameState.code}</h1>
            </div>
          </div>
        </div>
        {isHost ? (
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <button onClick={() => socket.startGame()} style={style.startGameBtn}>
              Start Game
            </button>
          </div>
        ) : (
          <p style={{ textAlign: "center", fontSize: 18 }}>
            Waiting for host to start the game...
          </p>
        )}
      </div>
    </div>
  )
}