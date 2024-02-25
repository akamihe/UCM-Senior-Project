import io from "socket.io-client";
import React, { useState} from 'react';
import { Form, Button } from 'react-bootstrap';
import { Client } from '@stomp/stompjs';


function Debug() {
    const socket = new Client({
        brokerURL: 'wss://localhost:8443/gameinstance'
    });
    const [data, setData] = useState(5.5);
    
    socket.onConnect = () => {
        console.log("server opened"); // trues
        setInterval(function() {
            socket.publish({
                destination: "/debug/game",
                body: JSON.stringify({'code': "alex"})
            });
        }, 10000);
        socket.subscribe("/debug/recieve", function(data) {
            console.log(data.body);
            setData(JSON.parse(data.body).value);
        });
    };
    socket.onWebSocketError(function(abc) {
        console.log('an error has occured', abc);
    });
      
    console.log(socket);
    socket.activate();
      return  <div>
            <Form>
                {data}
            </Form>
        </div>
}

export default Debug;