import { useEffect, useMemo , useRef, useState} from "react";
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
  playerListSelectColorPosition:{
    position: "absolute", 
    right: 52, 
    top: 8, 
    fontWeight: "bold",  
  },
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



export default function WaitingRoom(data) {
    var ignoredGames = useRef([]);
    var _socket = data.socket;
    var gameState = data.gameState;
    function handleSubmit(e) {
        _socket.startGame(gameState.chooseableGames.list.filter(x => !ignoredGames.current.includes(x)));
    }

    var users = gameState.users
  const navigate = useNavigate();
  const code = gameState.code;
  const isHost = gameState.self.gameMaster;
  function listOfGames() {
    return <div>
      {gameState.chooseableGames.list.map(d => gameData(d)) }
    </div>
  }
  function setUserColor(input) {
    _socket.setUserColor(input.target.value.substring(1));
  }
  function gameData(data) {
    function onClickIndv() {

    }
    function onClick() {
      if(ignoredGames.current.indexOf(data)==-1) {
          ignoredGames.current.push(data);
      } else {
          const index = ignoredGames.current.indexOf(data);
          ignoredGames.current.splice(index, 1);
      }
    }
    return <div key={data} onClick={onClick}>
        <input type="checkbox" checked={ignoredGames.current.indexOf(data)==-1} onChange={onClickIndv}></input>  {data}
      </div>
  }
  return (
    <div style={style.container}>
      <div style={style.contentContainer}>
        <div style={style.playersCodeContainer}>
          <div style={style.playersSection}>
            <p style={style.numPlayersText}>{users.length} Players</p>
            <div style={style.playersList}>
              {users.map((user, idx) => (
                <div key={idx} style={style.playersListItem(user.color)}>
                  <span style={style.playersListItemNum}>{idx + 1}</span>
                  {user.username}
                  {user.id == gameState.self.id && <input type="color" onChange={setUserColor} style={style.playerListSelectColorPosition} value={user.color}></input> }
                  {user.id == gameState.self.id && <span style={style.playersListItemYouText(gameState.self.color)}>You</span>}
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
            <button onClick={() => handleSubmit()} style={style.startGameBtn}>
              Start Game
            </button>
              <div style={{ fontSize: 18 }}>
                  {listOfGames()}
              </div>
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