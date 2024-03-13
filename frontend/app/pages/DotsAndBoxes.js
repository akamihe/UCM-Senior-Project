import React, { Component } from 'react';

const GameContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
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

class DotsAndBoxes extends Component {
  constructor(props) {
    super(props);
    this.state = this.initialBoard(8);
  }

  initialBoard = (size) => {
    let state = {
        boardSize: size,
        numRed: 0,
        numGreen: 0,
        numBlue: 0,
        numYellow: 0,
        turn: 1,
        winMessage: '',
        lineCoordinates: {},
        boxColors: {},
    };

    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < size; j++) {
            for (let k = 0; k < size + (i === 0 ? 1 : 0); k++) {
                state.lineCoordinates[`${i},${j},${k}`] = 0;
            }
        }
    }

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            state.boxColors[`${i},${j}`] = 'rgb(255,255,255)';
        }
    }

    return state;
};

fillLine = (i, j, k) => {
  const currentCoord = `${i},${j},${k}`;
  if (this.state.lineCoordinates[currentCoord] === 0) {
      this.setState(prevState => {
          const lineCoordinates = { ...prevState.lineCoordinates, [currentCoord]: prevState.turn };
          let squaresCompleted = false;
          let boxColors = { ...prevState.boxColors };
          let numRed = prevState.numRed, numGreen = prevState.numGreen, numBlue = prevState.numBlue, numYellow = prevState.numYellow;

          const potentialSquares = this.getPotentialSquares(i, j, k);

          potentialSquares.forEach(([sqY, sqX]) => {
              if (this.checkSquare(sqY, sqX, lineCoordinates)) {
                  squaresCompleted = true;
                  const colorKey = `num${this.getPlayerColor(prevState.turn).charAt(0).toUpperCase()}${this.getPlayerColor(prevState.turn).slice(1)}`;
                  boxColors[`${sqY},${sqX}`] = this.getPlayerColor(prevState.turn);
                  if (colorKey === "numRed") numRed++;
                  if (colorKey === "numGreen") numGreen++;
                  if (colorKey === "numBlue") numBlue++;
                  if (colorKey === "numYellow") numYellow++;
              }
          });

          const newState = {
              ...prevState,
              lineCoordinates,
              boxColors,
              numRed,
              numGreen,
              numBlue,
              numYellow,
              turn: squaresCompleted ? prevState.turn : (prevState.turn % 4) + 1,
          };

          return newState;
      }, () => {
          this.checkGameOver();
      });
  }
};

getPotentialSquares = (i, j, k) => {
    if (i === 0) {
        return [[j, k], [j - 1, k]].filter(([y, x]) => y >= 0 && x >= 0 && y < this.state.boardSize && x < this.state.boardSize);
    }
    else {
        return [[j, k], [j, k - 1]].filter(([y, x]) => y >= 0 && x >= 0 && y < this.state.boardSize && x < this.state.boardSize);
    }
};

checkSquare = (j, k, lineCoordinates) => {
    const topLine = `0,${j},${k}`;
    const bottomLine = `0,${j + 1},${k}`;
    const leftLine = `1,${j},${k}`;
    const rightLine = `1,${j},${k + 1}`;

    return [topLine, bottomLine, leftLine, rightLine].every(coord => lineCoordinates[coord] === 1 || lineCoordinates[coord] === 2 || lineCoordinates[coord] === 3 || lineCoordinates[coord] === 4);
};

checkGameOver = () => {
  const { lineCoordinates, boardSize } = this.state;
  const totalLines = 112
  const linesDrawn = Object.values(lineCoordinates).filter(coord => coord > 0).length;

  if (linesDrawn === totalLines) {
    this.setState(prevState => {
      const scores = [
        { player: 'Red', boxes: prevState.numRed },
        { player: 'Green', boxes: prevState.numGreen },
        { player: 'Blue', boxes: prevState.numBlue },
        { player: 'Yellow', boxes: prevState.numYellow },
      ];

      const highestScore = Math.max(...scores.map(score => score.boxes));
      const winners = scores.filter(score => score.boxes === highestScore).map(score => score.player);

      let winMessage = winners.length > 1 ? `${winners.join(', ')} win!` : `${winners[0]} wins!`;

      if (typeof this.props.onComplete === 'function') {
        this.props.onComplete(scores);
      }

      return {
        ...prevState,
        winMessage: `Game Over! ${winMessage}`,
      };
    });
  }
};

  makeWinMessage = (state) => {
    let winMessage;
    const winners = [];
    const maxScore = Math.max(state.numRed, state.numGreen, state.numBlue, state.numYellow);
    if (state.numRed === maxScore) winners.push('Red');
    if (state.numGreen === maxScore) winners.push('Green');
    if (state.numBlue === maxScore) winners.push('Blue');
    if (state.numYellow === maxScore) winners.push('Yellow');

    if (winners.length === 1) {
      winMessage = `${winners[0]} wins!`;
    } else {
      winMessage = `${winners.join(', ')} win!`;
    }

    return winMessage;
  };

  getPlayerColor = (player) => {
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

  makeBoard = () => {
    const rows = [];
    const dotMargin = 20;
    const dotSpacing = 30;
    for (let i = 0; i < this.state.boardSize; i++) {
        for (let j = 0; j < this.state.boardSize; j++) {
            rows.push(
                <React.Fragment key={`${i},${j}`}>
                    <div style={{ ...DotStyle, top: dotMargin + i * dotSpacing, left: dotMargin + j * dotSpacing }} />
                    {j < this.state.boardSize - 1 && (
                        <div
                            onClick={() => this.fillLine(0, i, j)}
                            style={{
                                ...LineContainerStyle,
                                top: dotMargin + i * dotSpacing + 5, 
                                left: dotMargin + j * dotSpacing + 10,
                                width: '20px',
                                height: '2px',
                                backgroundColor: this.state.lineCoordinates[`0,${i},${j}`] ? this.getPlayerColor(this.state.lineCoordinates[`0,${i},${j}`]) : 'transparent',
                            }}
                        />
                    )}
                    {i < this.state.boardSize - 1 && (
                        <div
                            onClick={() => this.fillLine(1, i, j)}
                            style={{
                                ...LineContainerStyle,
                                top: dotMargin + i * dotSpacing + 10,
                                left: dotMargin + j * dotSpacing + 5,
                                width: '2px',
                                height: '20px',
                                backgroundColor: this.state.lineCoordinates[`1,${i},${j}`] ? this.getPlayerColor(this.state.lineCoordinates[`1,${i},${j}`]) : 'transparent',
                            }}
                        />
                    )}
                </React.Fragment>
            );
        }
    }
    return rows;
};

  render() {
    const boxCounts = {
      red: this.state.numRed,
      green: this.state.numGreen,
      blue: this.state.numBlue,
      yellow: this.state.numYellow,
    };

    return (
      <div style={GameContainerStyle}>
        <div>
          <h1>Dots & Boxes</h1>
          <div style={InfoContainerStyle}>
            <div>
              Box Counts: Red: {boxCounts.red}, Green: {boxCounts.green}, Blue: {boxCounts.blue}, Yellow: {boxCounts.yellow}
            </div>
            <div>Player {this.state.turn}'s Turn</div>
          </div>
          <div style={{ position: 'relative' }}>{this.makeBoard()}</div>
          {this.state.winMessage && <p>{this.state.winMessage}</p>}
        </div>
      </div>
    );
  }
}

export default DotsAndBoxes;