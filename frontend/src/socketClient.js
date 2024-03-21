import { Client } from "@stomp/stompjs"
const socketClient = new Client({ brokerURL: "ws://localhost:8080/ws" });
export default socketClient;