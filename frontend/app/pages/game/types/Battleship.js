import { useEffect, useState, useRef } from 'react'

const style = {
  flexCenterContainer: {
    width: "100%", 
    height: "100%", 
    display: "flex", 
    flexDirection: "column", 
    justifyContent: "center", 
    alignItems: "center"
  },
  innerContainer: { width: "fit-content", display: "flex", flexDirection: "column", alignItems: "center" },
  header: { marginBottom: 16, display: "flex", width: "100%", alignItems: "center" },
  infoText: { fontSize: 16, flex: 1, textAlign: "right" },
  playerText: color => ({ color, fontWeight: "bold" }),
  board: myTurn => ({ 
    border: "1px solid dodgerblue", 
    borderWidth: "1px 0 0 1px", 
    opacity: myTurn ? 1 : 0.5, 
    cursor: myTurn ? "pointer" : "default" 
  }),
  boardRow: { display: "flex", borderBottom: "1px solid dodgerblue", width: "fit-content" },
  boardCell: {
    width: 40, 
    height: 40, 
    borderRight: "1px solid dodgerblue", 
    backgroundColor: "rgb(193, 252, 255)", 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    position: "relative"
  },
  shot: hit => ({
    position: "absolute", 
    top: "50%", 
    transform: "translate(0, -50%)", 
    width: "45%", 
    height: "45%", 
    backgroundColor: hit ? "red" : "dodgerblue", 
    borderRadius: "50%"
  }),
  gameEndText: {
    color: "maroon", 
    fontSize: 20, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginTop: 16, 
    fontStyle: "italic",
    height: 62
  },
  shotResultText: shotResult => ({
    fontWeight: "bold", 
    color: shotResult === "SHIP SUNK!" || shotResult === "HIT!" ? "red" : "dodgerblue", 
    fontSize: 20, 
    marginTop: 24, 
    textAlign: "center", 
    lineHeight: 1, 
    fontStyle: "italic",
    visibility: shotResult ? "visible" : "hidden",
    heigth: 62
  }),
  shipSegmentSvg: rotateDeg => ({ transform: `translate(-0.5px) rotate(${rotateDeg}deg) scale(1, 1.2)` })
};

export default function Battleship({socket, gameState}) {
    const [gameData, setGameData] = useState({});

    const connectedPlayers = gameState.users;
    const hasLoaded = useRef(false);
    if(hasLoaded.current == false) {
        socket.clearSubscriptions();
        socket.subscribeToBattleshipGame((data)=> {
            setGameData(data);
        });
        hasLoaded.current = true;
    }

    function selectCell(i, j) {
        socket.battleshipGameDataSet(i,j);
    }
    function ShipSegment({ship, i, j}) {
        const svgProps = { width: 35, height: 35, viewBox: "0 0 500 500", fill: "none", opacity: 0.6 };
      
        if (ship.length <= 1) {
          return ( // render whole boat if length is one
            <svg {...svgProps} viewBox="0 0 500 500" style={{ transform: "translate(-0.5px)" }}>
              <g>
                <path
                  style={{ fill: 'rgb(216, 216, 216)', stroke: 'rgb(0, 0, 0)', fillOpacity: 0, strokeWidth: '42px', transformBox: 'fill-box', transformOrigin: '50% 50%' }}
                  d="M 422.558 239.693 C 422.558 239.693 246.664 200.826 245.658 33.941"
                  transform="matrix(-1, 0, 0, -1, -0.000039, -0.000015)"
                />
                <path
                  style={{ fill: 'rgb(216, 216, 216)', stroke: 'rgb(0, 0, 0)', fillOpacity: 0, strokeWidth: '42px' }}
                  d="M 254.436 33.941 C 254.436 33.941 78.543 72.807 77.536 239.693"
                />
                <path
                  style={{ fill: 'rgb(216, 216, 216)', stroke: 'rgb(0, 0, 0)', fillOpacity: 0, strokeWidth: '42px', transformOrigin: '334.107px 363.183px' }}
                  d="M 422.558 260.307 C 422.558 260.307 246.664 299.173 245.658 466.058"
                  transform="matrix(-1, 0, 0, -1, -0.000035, -0.000019)"
                />
                <path
                  style={{ fill: 'rgb(216, 216, 216)', stroke: 'rgb(0, 0, 0)', fillOpacity: 0, strokeWidth: '42px' }}
                  d="M 254.437 466.058 C 254.437 466.058 78.543 427.193 77.537 260.307"
                />
                <line
                  style={{ fill: 'rgb(216, 216, 216)', stroke: 'rgb(0, 0, 0)', strokeWidth: '42px' }}
                  x1="77.556" y1="236.743" x2="77.442" y2="264.153"
                />
                <line
                  style={{ fill: 'rgb(216, 216, 216)', stroke: 'rgb(0, 0, 0)', strokeWidth: '42px' }}
                  x1="422.525" y1="238.443" x2="422.41" y2="265.853"
                />
              </g>
            </svg>
          )
        } else {
          const horizontal = ship.direction == 1 || ship.direction == 3;
          const idx = pointInShip(ship, i, j);
         
          if (idx > 0 && idx < ship.length - 1) {
            return ( // render middle portion of boat
              <svg {...svgProps} viewBox="0 0 500 500" style={style.shipSegmentSvg(horizontal ? 90 : 0)}>
                <g>
                  <line style={{ fill: 'rgb(216, 216, 216)', stroke: 'rgb(0, 0, 0)', strokeWidth: '42px' }} x1="77.6" y1="0" x2="77.4" y2="500"></line>
                  <line style={{ fill: 'rgb(216, 216, 216)', stroke: 'rgb(0, 0, 0)', strokeWidth: '42px' }} x1="422.5" y1="0" x2="422.2" y2="500"></line>
                </g>
              </svg>
            )
          } else {
            const rotateDeg = horizontal ? 90 * (idx === 0 ? -1 : 1) : (idx === 0 ? 0 : 180);
            return ( // render the end of the boat and rotate based on whether end is up/right/left/down
              <svg {...svgProps} viewBox="0 0 500 500" style={style.shipSegmentSvg(rotateDeg)}>
                <g>
                  <path style={{ fill: 'rgb(216,216,216)', stroke: 'rgb(0,0,0)', fillOpacity: 0, strokeWidth: '42px', transformBox: 'fill-box', transformOrigin: '50% 50%' }} d="M 422.558 239.693 C 422.558 239.693 246.664 200.826 245.658 33.941" transform="matrix(-1, 0, 0, -1, -0.000039, -0.000015)" />
                  <path style={{ fill: 'rgb(216,216,216)', stroke: 'rgb(0,0,0)', fillOpacity: 0, strokeWidth: '42px' }} d="M 254.436 33.941 C 254.436 33.941 78.543 72.807 77.536 239.693" />
                  <line style={{ fill: 'rgb(216,216,216)', stroke: 'rgb(0,0,0)', strokeWidth: '42px' }} x1="77.556" y1="236.743" x2="77.4" y2="500" />
                  <line style={{ fill: 'rgb(216,216,216)', stroke: 'rgb(0,0,0)', strokeWidth: '42px' }} x1="422.525" y1="238.443" x2="422.2" y2="500" />
                </g>
              </svg>
            );
          }
        }
      }
    function pointInShip(ship, x, y) {
        var xCordStart = ship.xcordStart;
        var yCordStart = ship.ycordStart;
        var length = ship.length;
        var direction = ship.direction;
        if(x == xCordStart) {
            if(direction == 0) {
                var pos = yCordStart-y;
                if(0 <= pos && pos < length) {
                    return length-1-pos;
                }
                //return (yCordStart - length) <= y && y <= yCordStart;
            } else if (direction == 2) {
                var pos = y-yCordStart;
                if(0 <= pos && pos < length) {
                    return pos;
                }
            }
        }
        if(y == yCordStart) {
            if(direction == 3) {
                var pos = xCordStart-x;
                if(0 <= pos && pos < length) {
                    return length-1-pos;
                }
            } else if (direction == 1) {
                var pos = x-xCordStart;
                if(0 <= pos && pos < length) {
                    return pos;
                }
            }
        }
        return -1;
    };
    const shipList = gameData.shipList;
    function getShip(x, y) {
        if(!shipList) {
            return null;
        }
        for(var i = 0; i < shipList.length; i++) {
            if(pointInShip(shipList[i], x, y) != -1) {
                return shipList[i];
            }
        }
        return null;
    };
    return <div style={style.flexCenterContainer}>
            <div style={style.innerContainer}>
                <div>
                <div style={style.header}>
                </div>
                <div style={style.board(true)}>
                    {Array.from({ length: 10 }, (_, j) => (
                    <div key={j} style={style.boardRow}>
                        {Array.from({ length: 10 }, (_, i) => {
                        const ship = getShip(i, j);
                        const isShipSunk = ship ? ship.shipSunk : false;
                        //const isShipSunk = ship && ship.every(cell => attacked.board[cell[0]][cell[1]]);
                        return (
                            <div key={i} onClick={() => selectCell(i, j)} style={style.boardCell}>
                            {ship && (!isShipSunk) && <ShipSegment ship={ship} i={i} j={j} />}
                            { (gameData.board && gameData.board.board[i][j]) ? <div style={style.shot(gameData.board.board[i][j] == 2)} /> : ''}
                            </div>
                        )
                        })}
                    </div>
                    ))}
                </div>
                </div>
                <div style={{ textAlign: "center" }}>
                <div style={style.gameEndText}>
                    {!gameData.defeated && !gameData.betweenRound && gameData.userData && <div><div>
                        {gameData.hitStatus == 0 ? 'Attacking ' : ''} 
                        {gameData.hitStatus == 3 ? 'Missed! while attacking ' : ''} 
                        {gameData.userData.username}  
                        {gameData.hitStatus == 1 ? ' was Hit!' : ''} 
                        {gameData.hitStatus == 2 ? ' Ship has Sunk!' : ''} 
                        </div> 
                        <div>
                            Time Left: { Math.round(gameData.timeRemaining/1000) }
                        </div>
                    </div>}
                    {!gameData.defeated && gameData.betweenRound && <div>Showing your own board</div> }
                    {gameData.defeated && <div>You are defeated</div> }
                </div>
                </div>
            </div>
        </div>
    }