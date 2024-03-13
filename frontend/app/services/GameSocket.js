const API_URL = 'https://localhost:8443'

import io from "socket.io-client";
import React, { useState} from 'react';
import { Form, Button } from 'react-bootstrap';
import { Client } from '@stomp/stompjs';

import ApiCallerService, { USER_NAME_TEMP_SESSION_ATTRIBUTE_NAME} from "./ApiCallerService";

export default class GameSocket {
    
    constructor(code) {
        this.userCode = code;
        this.gameInstance = null;
        this.onDisconnect = null;
        this.socket = new Client({
            brokerURL: 'wss://localhost:8443/game/instance'
        });
        var _this = this;
        this.socket.onConnect = () => {
            this.socket.subscribe("/game/instance/" + this.userCode, function(data) {
                if(data && data.body) {
                    var data = JSON.parse(data.body);
                    if(data && data.code) {
                        console.log(data);
                        _this.gameInstance = data;
                        if(_this.callable) {
                            _this.callable(_this.gameInstance);
                        }
                    } else if(!!data.disconnected && _this.onDisconnect) {
                        _this.onDisconnect();
                    } 
                }
            });
            setInterval(function(){
                _this.sendMessageToServer({});
            }, 1000);
        };
          
        this.socket.activate();
    }
    bindGameInstanceUpdate(callable) {
        this.callable = callable;
    }
    setOnDisconnect(disconnect) {
        this.onDisconnect = disconnect;
    }
    sendMessageToServer(data) {
        this.socket.publish({
            destination: "/game/instance/" + this.userCode,
            body: JSON.stringify(data)
        });
    }
    static getGameSocketInstance() { 
        let tempUser = JSON.parse(sessionStorage.getItem(USER_NAME_TEMP_SESSION_ATTRIBUTE_NAME));
        if(!this.gameSocket) {
            this.gameSocket = new GameSocket(tempUser.code);
        }
        return this.gameSocket;
    }
}
