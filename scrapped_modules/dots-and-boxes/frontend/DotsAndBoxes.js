import React, { useState, useEffect, useRef } from 'react';

const GameContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  width: 'inherit',
  paddingTop: '25px',
};

const DotStyle = {
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  backgroundColor: 'black',
  position: 'absolute',
};

const LineContainerStyle = {
  position: 'absolute',
  cursor: 'pointer',
};

const InfoContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  width: '300px',
  marginBottom: '20px',
};

const DotsAndBoxes = ({ socket, gameState }) => {
  const [gameData, setGameData] = useState({
    boardSize: 8,
    lineCoordinates: {},
    numRed: 0,
    numGreen: 0,
    numBlue: 0,
    numYellow: 0,
    turn: null,
    winMessage: null,
  });

  const connectedPlayers = gameState.users;
  const hasLoaded = useRef(false);

  useEffect(() => {
    const handleGameDataUpdate = (updatedGameData) => {
        setGameData(prevState => {
            return { ...prevState, ...updatedGameData };
        });
    };
    socket.subscribeToDotsAndBoxesGame(handleGameDataUpdate);
    return () => {
        socket.clearSubscriptions(handleGameDataUpdate);
    };
}, [socket]);

const fillLine = (i, j, k) => {
  const currentCoord = `${i},${j},${k}`;
  if (!gameData.lineCoordinates[currentCoord]) {
    setGameData(prevGameData => {
      const updatedLineCoordinates = { ...prevGameData.lineCoordinates, [currentCoord]: 1 };
      return { ...prevGameData, lineCoordinates: updatedLineCoordinates };
    });
    socket.dotsAndBoxesGameDataSet(i, j, k);
  }
};

  const makeBoard = () => {
    // Ensure gameData is properly structured before attempting to render the board
    const boardSize = gameData.boardSize || calculateBoardSize(gameData.lineCoordinates);

    if (!gameData || boardSize <= 0 || gameData.lineCoordinates === undefined) {
      return <div>Loading board...</div>;
    }
  
    const rows = [];
    const dotMargin = 20; // Margin around the dots
    const dotSpacing = 30; // Space between the dots
  
    // Iterate through the grid based on the boardSize
    for (let i = 0; i < gameData.boardSize; i++) {
      for (let j = 0; j < gameData.boardSize; j++) {
        // Add dots
        rows.push(
          <div key={`dot-${i}-${j}`} style={{ ...DotStyle, top: dotMargin + i * dotSpacing, left: dotMargin + j * dotSpacing }} />
        );
  
        // Add horizontal lines between dots
        if (j < gameData.boardSize - 1) {
          const horizontalKey = `0,${i},${j}`;
          rows.push(
            <div
              key={`h-line-${i}-${j}`}
              onClick={() => fillLine(0, i, j)}
              style={{
                ...LineContainerStyle,
                top: dotMargin + i * dotSpacing + 5,
                left: dotMargin + j * dotSpacing + 10,
                width: '20px',
                height: '2px',
                backgroundColor: gameData.lineCoordinates[horizontalKey] ? 'black' : 'transparent',
              }}
            />
          );
        }
  
        // Add vertical lines between dots
        if (i < gameData.boardSize - 1) {
          const verticalKey = `1,${i},${j}`;
          rows.push(
            <div
              key={`v-line-${i}-${j}`}
              onClick={() => fillLine(1, i, j)}
              style={{
                ...LineContainerStyle,
                top: dotMargin + i * dotSpacing + 10,
                left: dotMargin + j * dotSpacing + 5,
                width: '2px',
                height: '20px',
                backgroundColor: gameData.lineCoordinates[verticalKey] ? 'black' : 'transparent',
              }}
            />
          );
        }
      }
    }
  
    return rows;
  };

  const calculateBoardSize = (lineCoordinates) => {
    return 8;
  };

  return (
    <div style={GameContainerStyle}>
      <div>
        <h1>Dots & Boxes</h1>
        <div style={InfoContainerStyle}>
          <div>
            {gameData ? (
              <div>
              Box Counts: Red: {gameData.numRed}, Green: {gameData.numGreen}, Blue: {gameData.numBlue}, Yellow: {gameData.numYellow}
            </div>
            ) : (
              "Loading game data..."
            )}
          </div>
          <div>{gameData.turn ? `Player ${gameData.turn}'s Turn` : "Waiting for player's turn"}</div>
        </div>
        {gameData && (
          <div style={{ position: 'relative' }}>
            {makeBoard()}
            {gameData.winMessage && <p>{gameData.winMessage}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default DotsAndBoxes;
