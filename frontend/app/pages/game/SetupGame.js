import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import AuthService from '/app/services/AuthService';
  
const ErrorForm = props => {
    return (
        <div className="row pl-2 text-danger mt-5 text-center font-bold" style={{ height: 24 }}>
            <p>{props.error}</p>
        </div>
    );
};

function Join() {
    const [error, setError] = useState("");
    
    const submitUser = (e) => {
        e.preventDefault();
        
        AuthService.createGame()
            .then((data) => {
                window.location.href = "/game/active";
                setError("");
            })
            .catch(() => {
                setError("Error joining game");
            });
    };
    
    return <div className="row justify-content-lg-center h-100 p-5">
            <div className="col-lg-5 h-100 d-flex flex-column">
                <div className="text-center lg-3 mb-4">
                    <h2>Start Game</h2>
                </div>
                <div
                    className="d-flex flex-column justify-content-center align-items-center col-12"
                    style={{ flex: 0.8 }}
                >
                        <>
                            <Form className="col-12" onSubmit={submitUser}>
                                <div className="mt-4 text-center">
                                    <Button variant="primary" style={{width: 100}} type="submit">
                                        Create Game 
                                    </Button>
                                </div>
                            </Form>
                            <ErrorForm error={error} />
                        </>
                </div>
            </div>
        </div>
}

export default Join;