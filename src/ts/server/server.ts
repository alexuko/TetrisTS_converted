import WebSocket from "ws";
import { v4 as uuid } from "uuid";

const wss = new WebSocket.Server({ port: 8080 });
let clients: string[] = [];


wss.on("connection", (ws, req) => {
  console.log("New client connected");
  const newClient = uuid();
  ws.send(newClient)
  clients.push(newClient);
  console.log(`Clients connected: ${clients.length}`);
  console.log(`clients connected: ${clients}`);
  // console.log(ws);

  ws.on("message", (clientMsg) => {
    console.log(`Message from Client.`)

    // wss.send(`your message was received: ${clientMsg}`)
    
    wss.clients.forEach((client) => {
      //broadcast message to every client except the one who sent the msg
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(clientMsg);
        }
        
      });
    });

  // if a client closes session
  ws.on("close", () => {
    console.log("Client session closed");
    //find its index to eliminate user from the array
    const clientIndex = clients.findIndex((client) => client === newClient);
    //then remove client from the array with the index
    clients.splice(clientIndex, 1);
    //testing
    console.log(`clients left: ${clients}`);
  });
});
