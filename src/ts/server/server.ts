import WebSocket from "ws";
import { v4 as uuid } from "uuid";
import { Header } from "../assets/assets";
const wss = new WebSocket.Server({ port: 8080 });
let clients: string[] = [];

const removeClient = (clientLeaving: string) => {
  console.log("Client session closed");
  //find its index to eliminate user from the array
  const clientIndex = clients.findIndex(client => client === clientLeaving);
  //then remove client from the array with the index
  clients.splice(clientIndex, 1);
  //testing
  console.log(`Clients left in Server: ${clients}`);
};

const addClient = (ws: WebSocket) => {
  const client_id = uuid();
  const connection = {
    'header': Header.CONNECT,
    'message': client_id
  }
  const response = JSON.stringify(connection);
  ws.send(response)
  clients.push(client_id);
  console.log(`New client,clientID: ${client_id}, Clients connected: ${clients.length}`);
  return client_id;  
}

const broadcast = (ws:WebSocket,message: any) => {
  wss.clients.forEach((client) => {
    //broadcast message to every client except the one who sent the msg
      // if (client.readyState === WebSocket.OPEN) {
      //   client.send(message);
      // }
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
      
    });
}
wss.on("connection", (ws, req) => {
  // create a new client 
  const newClient = addClient(ws);
  
  ws.on("message", (client_message) => { 
    // convert data so we can handle it.
    const message = client_message;
    const messageToString = client_message.toString();
    const messageToJSON = JSON.parse(messageToString);
    const header = messageToJSON.header;

    if(!header) return;   
    console.log(`header: ${header}`);
    switch(header){
      case Header.NEWGAME:
        //request the server to create a new game
        break;  
        case Header.JOIN:
        //request the server to join game
        //send the game id you wanna join
        break;  
      case Header.PLAY:
        //broadcast client message to everyone
        broadcast(ws, message);
        break;  
      case Header.QUIT:
        //client lost
        broadcast(ws, message);
        removeClient(newClient);
        break;  
      default:
        console.log('Unknown action')
    }


    });   

  // if a client closes session
  ws.on("close", () => {
    let msg = {'header':Header.QUIT,'clientID': newClient}
    //notify everyone tha the client dropped the connection 
    const message = JSON.stringify(msg)
    broadcast(ws,message)
    removeClient(newClient);
  });


});

