import { useEffect, useState } from 'react'
import socketClient from "./socketClient"
import WaitingRoom from './WaitingRoom';
import Games from './Games';

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    // For developer convenience, clear players on hot reload to prevent 
    // any player data mismatch upon HMR (hot module replacement) file change
    if (socketClient.connected)
      socketClient.publish({ destination: "/app/clearPlayers" });
  });
}

const colors = ["#cc0000", "#228B22", "#0000cc", "#cc7700", "#9700cc"];

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [players, setPlayers] = useState([]);
  const [showWaitingRoom, setShowWaitingRoom] = useState(true);

  const player = players.find(player => player.isMe);
  // Either because game session has already started or the game session is full
  const isNotInGame = players.length > 0 && !player;

  useEffect(() => {
    socketClient.onConnect = () => {
      socketClient.subscribe("/user/queue/sessionId", message => {
        const sessionId = message.body;

        socketClient.subscribe("/topic/updatePlayers", message => {
          const players = JSON.parse(message.body);
          setPlayers(players.map((player, idx) => ({ 
            ...player, 
            isMe: player.id === sessionId,
            color: colors[idx] 
          })));
        })

        socketClient.publish({ destination: "/app/register" });
      })

      setIsConnected(true);
      socketClient.publish({ destination: "/app/sessionId" });
    }
    
    socketClient.onDisconnect = () => setIsConnected(false);
    socketClient.activate();

    return () => {
      socketClient.deactivate(); // Disconnect client when component unmounts
    }
  }, [])

  useEffect(() => {
    if (isConnected) {
      const subscription = socketClient.subscribe("/topic/startGames", () => {
        if (!isNotInGame)
          setShowWaitingRoom(false);
      })

      return () => subscription.unsubscribe();
    }
  }, [isConnected, isNotInGame])

  useEffect(() => {
    console.log(players);
  }, [players])

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      {showWaitingRoom ? (
        <WaitingRoom connected={isConnected} players={players} />
      ) : (
        <Games connected={isConnected} players={players} />
      )}
    </div>
  )
}

export default App