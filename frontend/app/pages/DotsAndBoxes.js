import React, { useState } from 'react';

const GameContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '100vh',
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

const DotsAndBoxes = () => {
  const [lineCoordinates, setLineCoordinates] = useState({});
  const [boxColors, setBoxColors] = useState({});
  const [turn, setTurn] = useState(1); // Player 1 starts
  const [winMessage, setWinMessage] = useState('');

  const fillLine = (i, j, k) => {
    const currentCoord = `${i},${j},${k}`;
    if (!lineCoordinates[currentCoord]) {
      setLineCoordinates((prevLineCoordinates) => ({
        ...prevLineCoordinates,
        [currentCoord]: turn,
      }));

      const lineColor = getPlayerColor(turn);
      let madeSquare = false;

      // Check if box is completed
      if (
        i === 0 &&
        j > 0 &&
        k < 7 &&
        lineCoordinates[`1,${k},${j}`] &&
        lineCoordinates[`1,${k},${j + 1}`] &&
        lineCoordinates[`0,${j},${k}`]
      ) {
        setBoxColors((prevBoxColors) => ({
          ...prevBoxColors,
          [`${j},${k}`]: lineColor,
        }));
        madeSquare = true;
      }
      if (
        i === 0 &&
        j < 7 &&
        k < 7 &&
        lineCoordinates[`1,${k},${j}`] &&
        lineCoordinates[`1,${k},${j + 1}`] &&
        lineCoordinates[`0,${j + 1},${k}`]
      ) {
        setBoxColors((prevBoxColors) => ({
          ...prevBoxColors,
          [`${j},${k}`]: lineColor,
        }));
        madeSquare = true;
      }
      if (
        i === 1 &&
        j < 7 &&
        k > 0 &&
        lineCoordinates[`0,${j},${k}`] &&
        lineCoordinates[`0,${j + 1},${k}`] &&
        lineCoordinates[`1,${k},${j}`]
      ) {
        setBoxColors((prevBoxColors) => ({
          ...prevBoxColors,
          [`${k},${j}`]: lineColor,
        }));
        madeSquare = true;
      }
      if (
        i === 1 &&
        j < 7 &&
        k < 7 &&
        lineCoordinates[`0,${j},${k + 1}`] &&
        lineCoordinates[`0,${j + 1},${k + 1}`] &&
        lineCoordinates[`1,${k},${j}`]
      ) {
        setBoxColors((prevBoxColors) => ({
          ...prevBoxColors,
          [`${k},${j}`]: lineColor,
        }));
        madeSquare = true;
      }

      if (madeSquare) {
        const playerColor = getPlayerColor(turn);
        const updatedBoxCounts = { ...getBoxCounts(boxColors) };
        updatedBoxCounts[playerColor.toLowerCase()]++;
        if (Object.values(updatedBoxCounts).reduce((acc, count) => acc + count, 0) === 64) {
          checkGameOver(boxColors);
        } else {
          setTurn(turn);
        }
      } else {
        setTurn((prevTurn) => (prevTurn % 4) + 1); // Next player's turn
      }
    }
  };

  const checkSquare = (j, k) => {
    let count = 0;
    if (lineCoordinates[`0,${j},${k}`]) count++;
    if (lineCoordinates[`0,${j},${k + 1}`]) count++;
    if (lineCoordinates[`1,${k},${j}`]) count++;
    if (lineCoordinates[`1,${k},${j + 1}`]) count++;
    return count;
  };

  const checkGameOver = (boxColors) => {
    const players = [0, 0, 0, 0]; // Red, Green, Blue, Yellow
    Object.values(boxColors).forEach((color) => {
      switch (color) {
        case 'red':
          players[0]++;
          break;
        case 'green':
          players[1]++;
          break;
        case 'blue':
          players[2]++;
          break;
        case 'yellow':
          players[3]++;
          break;
        default:
          break;
      }
    });
    const maxScore = Math.max(...players);
    const winningPlayers = players.reduce((acc, player, index) => {
      if (player === maxScore) {
        acc.push(index + 1);
      }
      return acc;
    }, []);
    setWinMessage(`Player ${winningPlayers.join(', ')} wins!`);
  };

  const getPlayerColor = (player) => {
    switch (player) {
      case 1:
        return 'red';
      case 2:
        return 'green';
      case 3:
        return 'blue';
      case 4:
        return 'yellow';
      default:
        return 'white';
    }
  };

  const makeBoard = () => {
    const rows = [];
    const dotMargin = 20;
    const dotSpacing = 30;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        rows.push(
          <React.Fragment key={`${i},${j}`}>
            <div style={{ ...DotStyle, top: dotMargin + i * dotSpacing, left: dotMargin + j * dotSpacing }} />
            {j < 7 && (
              <div
                onClick={() => fillLine(0, i, j)}
                style={{
                  ...LineContainerStyle,
                  top: dotMargin + i * dotSpacing + 4,
                  left: dotMargin + j * dotSpacing + 10,
                  width: '20px',
                  height: '2px',
                  backgroundColor: lineCoordinates[`0,${i},${j}`] ? getPlayerColor(lineCoordinates[`0,${i},${j}`]) : 'transparent',
                }}
              />
            )}
            {i < 7 && (
              <React.Fragment>
                <div
                  onClick={() => fillLine(1, j, i)}
                  style={{
                    ...LineContainerStyle,
                    top: dotMargin + i * dotSpacing + 10,
                    left: dotMargin + j * dotSpacing + 4,
                    width: '2px',
                    height: '20px',
                    backgroundColor: lineCoordinates[`1,${j},${i}`] ? getPlayerColor(lineCoordinates[`1,${j},${i}`]) : 'transparent',
                  }}
                />
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: boxColors[`${j},${i}`] || 'transparent',
                    position: 'absolute',
                    top: dotMargin + i * dotSpacing - 5,
                    left: dotMargin + j * dotSpacing - 5,
                  }}
                />
              </React.Fragment>
            )}
          </React.Fragment>
        );
      }
    }
    return rows;
  };

  const getBoxCounts = (boxColors) => {
    return {
      red: Object.values(boxColors).filter((color) => color === 'red').length,
      green: Object.values(boxColors).filter((color) => color === 'green').length,
      blue: Object.values(boxColors).filter((color) => color === 'blue').length,
      yellow: Object.values(boxColors).filter((color) => color === 'yellow').length,
    };
  };

  const boxCounts = getBoxCounts(boxColors);

  return (
    <div style={GameContainerStyle}>
      <div>
        <h1>Dots & Boxes</h1>
        <div style={InfoContainerStyle}>
          <div>
            Box Counts: Red: {boxCounts.red}, Green: {boxCounts.green}, Blue: {boxCounts.blue}, Yellow: {boxCounts.yellow}
          </div>
          <div>Player {turn}'s Turn</div>
        </div>
        <div style={{ position: 'relative' }}>{makeBoard()}</div>
        {winMessage && <p>{winMessage}</p>}
      </div>
    </div>
  );
};

export default DotsAndBoxes;