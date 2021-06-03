import WebSocket from "ws";
import { v4 as uuid } from "uuid";
import { Header } from "../assets/assets";
const wss = new WebSocket.Server({ port: 8080 });
let clients: string[] = [];
let games: any = {}

const removeClient = (clientLeaving: string) => {
  console.log("Client session closed");
  //find its index to eliminate user from the array
  const clientIndex = clients.findIndex(client => client === clientLeaving);
  //then remove client from the array with the index
  clients.splice(clientIndex, 1);
  //testing
  console.log(`Clients left in Server: ${clients}`);
};

const isConnected = (userID: string) => {
    return clients.includes(userID)
}

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

const broadcast = (ws: WebSocket, message: any) => {
  wss.clients.forEach((client) => {
    //broadcast message to every client except the one who sent the msg
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }    
  });
};

const broadcastNotYou = (ws: WebSocket, message: any) => {
  wss.clients.forEach((client) => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};



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
    switch (header) {
      case Header.REQ_GAME:
        //user requested to create a new game
        const user = messageToJSON.user;
        //check that user is connected
        //if connected the create game id
        if (isConnected(user)) {
          const gameID = `game-${uuid()}`;
          const msg = {
            header: Header.NEW_GAME,
            gameID: gameID,
          };
          const message = JSON.stringify(msg);
          //add new game to games object
          games[gameID] = {
            gameID: gameID,
            players: []
          };
          //send info to the user
          ws.send(message);
          console.log(`Game created:`)
          console.log(games)
        }
        break;
      case Header.JOIN:
        console.log('request to join game')
        const clientID = messageToJSON.clientID.toString();
        const gameID = messageToJSON.gameID.toString();
        // console.log(`Client: ${clientID}, GameID: ${gameID}`)
        //check if the game exists
        let game = games[gameID]
        console.log('GAMES')
        console.log(game)
        try {
          if(game){
            game.players.push(clientID)
            if(game.players.length > 1){
              //play
              const msg = {
                header: Header.START_GAME,
                playing: true,
                multiplayer: true
              };
              console.log('HERE')
              console.log(game)  
              broadcast(ws,JSON.stringify(msg));
             return;
                
            }
            console.log('you are alone')
            console.log(games);
          }
          
        } catch (error) {
          console.log(error)
        }
       
        break;
      case Header.PLAY:
        //broadcast client message to everyone
        broadcastNotYou(ws, message);
        break;
      case Header.QUIT:
        //client lost
        broadcast(ws, message);
        removeClient(newClient);
        break;
      default:
        console.log("Unknown action");
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

