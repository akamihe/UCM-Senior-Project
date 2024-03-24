import React, { useState, useEffect, useRef } from 'react';
import { Form, Button } from 'react-bootstrap';
import AuthService from '/app/services/AuthService';
  
const ErrorForm = props => {
    return (
        <div className="row pl-2 text-danger mt-5 text-center font-bold" style={{ height: 24 }}>
            <p>{props.error}</p>
        </div>
    );
};

function UserBody({game}) {
    if(!game || game.length == 0) {
        return <div></div>
    }
    return <div>
        {Object.keys(game).map(function(name){
            return <div key={name}> {name}: {game[name]}</div>;
        })}
    </div>
}

function DebugGame({socket, gameState}) {
    const [error, setError] = useState("");
    const [debugGameData, setdebugGameData] = useState([]);
    const hasLoaded = useRef(false);
    if(hasLoaded.current == false) {
        socket.subscribeToDebugGame((e)=> {
            setdebugGameData(e.data);
        });
        hasLoaded.current = true;
    }
    const changeValue = (e) => {
        socket.debugGameInput({test: e.target.value})
    }
    
    return <div className="row justify-content-lg-center h-100 p-5">
            <div className="col-lg-5 h-100 d-flex flex-column">
                <div className="text-center lg-3 mb-4">
                    <h2>User input game test</h2>
                </div>
                <div
                    className="d-flex flex-column justify-content-center align-items-center col-12"
                    style={{ flex: 0.8 }}
                >
                    
                        <>
                            <Form className="col-12">
                                <Form.Group controlId="username" style={{marginBottom: 16}}>
                                    <Form.Label style={{marginBottom: 4}}>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter test data"
                                        onChange={changeValue}
                                        name="test"
                                        required
                                    />
                                    All Other Users Inputs
                                    <UserBody game={debugGameData} />
                                </Form.Group>
                            </Form>
                            <ErrorForm error={error} />
                        </>
                    
                </div>
            </div>
        </div>
}

export default DebugGame;