const API_URL = 'http://localhost:8443'
const DEFAULT_EXT_PORT = '8443'
const DEFAULT_SELF_PORT = '3000'

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
        this.activeSubscriptions = new Map(); //map
        var app_url = process.env.app_url || (window.location.host).replace(DEFAULT_SELF_PORT, DEFAULT_EXT_PORT);
        this.socket = new Client({
            brokerURL: `ws://${app_url}/game/instance`
        });
        var _this = this;
        this.socket.onConnect = () => {
            this.socket.subscribe("/broker/wake/" + this.userCode, function(data) {
                if(data && data.body) {
                    var data = JSON.parse(data.body);
                    if(data && data.code) {
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
                _this.sendWakeMessageToServer({});
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
    sendMessageToServer(url, data) {
        this.socket.publish({
            destination: (url + "/" + this.userCode),
            body: JSON.stringify(data)
        });
    }
    subscribe(url, callback, interval=true) {
        if(this.activeSubscriptions.has(url)) {
            console.log("Function subscription called twice, check your code!!!");
            return;
        }
        var intervalObject = null;
        if(interval) {
            var urlCpy = url;
            var _this = this;
            intervalObject = setInterval(function(){
                _this.sendMessageToServer(urlCpy, {});
            }, 1000)
        }
        this.activeSubscriptions.set(url, intervalObject);
        url += '/' + this.userCode;
        this.socket.subscribe(url, function(data) {
            if(data && data.body && data.body != "{}") {
                var data = JSON.parse(data.body);
                if(data && data) {
                    callback(data);
                }
            }
        });
    }
    unsubscribe(url) {
        clearInterval(this.activeSubscriptions.get(url));
        this.activeSubscriptions.delete(url);
        url += '/' + this.userCode;
        this.socket.unsubscribe(url);
    }
    clearSubscriptions() {
        for(var i = 0; i < this.activeSubscriptions.length; i++) {
            this.unsubscribe(this.activeSubscriptions[i]);
        }
        this.activeSubscriptions = new Map();
    }
    sendWakeMessageToServer(data) {
        this.sendMessageToServer('/broker/wake', data);
    }
    startGame(list) {
        this.sendMessageToServer("/broker/start", {list:list});
    }
    //broker other details
    setUserColor(color) {
        this.sendMessageToServer("/broker/setProfileColor", {color:color})
    }


    //debug game
    debugGameInput(data) {
        this.sendMessageToServer("/game/debug/input", data);
    }
    subscribeToDebugGame(callback) {
        this.subscribe("/game/debug/listen", callback);
    }
    //sudoku game

    subscribeToSudokuGame(callback) {
        this.subscribe("/game/sudoku/listen", callback);
    }

    sudokuGameDataSet(x, y, value) {
        this.sendMessageToServer("/game/sudoku/setValue", {x:x, y:y, value:value});
    }


    //battleship game
    subscribeToBattleshipGame(callback) {
        this.subscribe("/game/battleship/listen", callback);
    }

    battleshipGameDataSet(x, y) {
        this.sendMessageToServer("/game/battleship/setValue", {x:x, y:y});
    }



    static getGameSocketInstance() { 
        let tempUser = JSON.parse(sessionStorage.getItem(USER_NAME_TEMP_SESSION_ATTRIBUTE_NAME));
        if(!this.gameSocket) {
            this.gameSocket = new GameSocket(tempUser.code);
        }
        return this.gameSocket;
    }
}
