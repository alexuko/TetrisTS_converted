import WebSocket from "ws";

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws, req) => {
  console.log("New client connected");
  ws.send("Now, you are connected to the server!");

  ws.on("message", (clientMsg) => {
    // console.log(`Message from Client.`)
    ws.send(`Server received your message!`);
    
    // wss.send(`your message was received: ${clientMsg}`)
    wss.clients.forEach((client) => {
      //broadcast message to every client including itself
      if (client.readyState === WebSocket.OPEN) {
        client.send(clientMsg);
      }
      //broadcast message to every client except the one who sent the msg
      // if (client !== ws && client.readyState === WebSocket.OPEN) {
      //   client.send(clientMsg);
      // }
    });
  });

  // if a client closes session
  ws.on("close", () => {
    console.log("Client session closed");
  });
});
