import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

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

const users = [
  { name: "john_doe" },
  { name: "jane_doe" },
  { name: "jack_doe", you: true },
  { name: "jill_doe" },
]

const WaitingRoom = () => {
  const navigate = useNavigate();

  const code = useMemo(() => Math.floor(Math.random() * 900000) + 100000, [])
  const colors = ["#cc0000", "#00cc00", "#0000cc", "#cc7700"];
  const isHost = true;

  return (
    <div style={style.container}>
      <div style={style.contentContainer}>
        <div style={style.playersCodeContainer}>
          <div style={style.playersSection}>
            <p style={style.numPlayersText}>{users.length} Players</p>
            <div style={style.playersList}>
              {users.map((user, idx) => (
                <div key={idx} style={style.playersListItem(colors[idx])}>
                  <span style={style.playersListItemNum}>{idx + 1}</span>
                  {user.name}
                  {user.you && <span style={style.playersListItemYouText(colors[idx])}>You</span>}
                </div>
              ))}
            </div>
          </div>
          <div style={style.codeSection}>
            <p style={{ textAlign: "center" }}>Game code: </p>
            <div style={style.codeTextContainer}>
              <h1 style={{ letterSpacing: 16, fontSize: 108 }}>{code}</h1>
            </div>
          </div>
        </div>
        {isHost ? (
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <button onClick={() => navigate("/game")} style={style.startGameBtn}>
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

export default WaitingRoom;