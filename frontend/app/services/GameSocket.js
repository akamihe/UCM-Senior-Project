import { Client } from '@stomp/stompjs';
import { USER_NAME_TEMP_SESSION_ATTRIBUTE_NAME } from "./ApiCallerService";

const colors = ["#cc0000", "#228B22", "#0000cc", "#cc7700", "#9700cc", "#00cbcc"];

export default class GameSocket {
    constructor(code) {
        this.socket = new Client({ brokerURL: 'ws://localhost:8443/game/instance' });
        this.userCode = code;
        this.gameState = {};

        this.onConnect = null;
        this.onServerDisconnect = null;
        this.onUpdateGameState = null;

        this.socket.onConnect = this.handleConnect.bind(this);
        this.socket.onWebSocketClose = this.handleServerDisconnect.bind(this);
        this.socket.activate();
    }

    handleConnect() {
        this.socket.subscribe(`/broker/getUser/${this.userCode}`, message => {
            if (message.body) {
                this.user = JSON.parse(message.body);
    
                this.subscribe("/broker/updateGameState", data => {
                    if (data && this.onUpdateGameState) {
                        this.onUpdateGameState({
                            ...data,
                            users: data.users.map((user, idx) => ({
                                ...user, 
                                isMe: this.user.instanceId === user.id,
                                color: colors[idx]
                            }))
                        });
                    }
                });
    
                this.sendGameMessageToServer("/broker/getGameState");
                this.onConnect();
            }
        })

        this.socket.publish({ destination: `/broker/getUser/${this.userCode}` });
    }

    handleServerDisconnect() {
        if (this.onServerDisconnect)
            this.onServerDisconnect();
    }

    battleshipInitGame() {
        this.sendGameMessageToServer("/game/battleshipInitGame");
    }

    battleshipSelectCell(row, col) {
        this.sendGameMessageToServer("/game/battleshipSelectCell", JSON.stringify({ row, col }));
    }

    cancelTimer() {
        this.sendGameMessageToServer("/broker/cancelTimer");
    }

    endGame() {
        this.sendGameMessageToServer("/broker/endGame")
    }

    static getGameSocketInstance() { 
        let tempUser = JSON.parse(sessionStorage.getItem(USER_NAME_TEMP_SESSION_ATTRIBUTE_NAME));
        if(!this.gameSocket) {
            this.gameSocket = new GameSocket(tempUser.code);
        }
        return this.gameSocket;
    }

    nextGame() {
        this.sendGameMessageToServer("/broker/nextGame")
    }

    pictionaryInitGame() {
        this.sendGameMessageToServer("/game/pictionaryInitGame");
    }

    pictionaryUpdateCanvasData(canvasData) {
        this.sendGameMessageToServer("/game/pictionaryUpdateCanvasData", JSON.stringify(canvasData));
    }

    pictionaryCorrectGuess() {
        this.sendGameMessageToServer("/game/pictionaryCorrectGuess", JSON.stringify(this.user));
    }
    
    pictionaryEndTurn() {
        this.sendGameMessageToServer("/game/pictionaryEndTurn");
    }

    sendGameMessageToServer(url, data) {
        this.socket.publish({ destination: url + "/" + this.user.gameCode, body: data });
    }

    subscribe(url, callback) {
        this.socket.subscribe(`${url}/${this.user.gameCode}`, message => {
            callback(message.body ? JSON.parse(message.body) : null);
        });
    }

    startGame() {
        this.sendGameMessageToServer("/broker/start");
    }

    startCountdown(count) {
        this.sendGameMessageToServer("/broker/startCountdown", count);
    }

    startTimer(seconds) {
        this.sendGameMessageToServer("/broker/startTimer", seconds); 
    }

    sudokuInitGame() {
        this.sendGameMessageToServer("/game/sudokuInitGame")
    }

    sudokuFinish(timerEnded) {
        const data = JSON.stringify({ user: this.user, timerEnded });
        this.sendGameMessageToServer("/game/sudokuFinish", data);
    }

    unsubscribe(url) {
        this.socket.unsubscribe(`${url}/${this.user.gameCode}`);
    }
}
