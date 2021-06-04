import WebSocket from "ws";
import { v4 as uuid } from "uuid";
import { Header } from "../assets/assets";
const wss = new WebSocket.Server({ port: 8080 });
let clients: string[] = [];
let games: any = {};

const removeClient = (clientLeaving: string) => {
  console.log("Client session closed");
  //find its index to eliminate user from the array
  const clientIndex = clients.findIndex((client) => client === clientLeaving);
  //then remove client from the array with the index
  clients.splice(clientIndex, 1);
  //testing
  console.log(`Clients left in Server: ${clients}`);
  if(clients.length < 1){
    clients = []
    games = {}
  }
};

const isConnected = (userID: string) => {
  return clients.includes(userID);
};

const addClient = (ws: WebSocket) => {
  const client_id = uuid();
  const connection = {
    header: Header.CONNECT,
    message: client_id,
  };
  const response = JSON.stringify(connection);
  ws.send(response);

  clients.push(client_id);
  console.log(
    `New client,clientID: ${client_id}, Clients connected: ${clients.length}`
  );
  return client_id;
};

const broadcast = (ws: WebSocket, message: any) => {
  wss.clients.forEach((client) => {
    //broadcast everybody
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
    
  });
};

const broadcastNotYou = (ws: WebSocket, message: any) => {
  wss.clients.forEach((client) => {
    //broadcast everybody except current client  
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

const invalidGameID = () => {
  console.log('invalid game ID')
  const msg = {
    header: Header.INVALID    
  };
  return JSON.stringify(msg);
}

const hardDrop = () => {
  const msg = {
    header: Header.HARD_DROP    
  };
  return JSON.stringify(msg);
}

const punishmentLine = () => {
  const msg = {
    header: Header.EXTRA_LINE    
  };
  return JSON.stringify(msg);
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

    if (!header) return;
    // console.log(`header: ${header}`);
    switch (header) {
      case Header.REQ_GAME:
        //user requested to create a new game
        const user = messageToJSON.user;
        const num_players = messageToJSON.num_players;
        console.log(messageToJSON)
        //check that user is connected
        //if connected the create game id
        if (isConnected(user)) {
          const gameID = `game-${uuid()}`;
          const msg = {
            header: Header.NEW_GAME,
            gameID: gameID,
            num_players: num_players
          };
          const message = JSON.stringify(msg);
          //add new game to games object
          games[gameID] = {
            gameID: gameID,
            num_players: num_players,
            players: []
          };
          //send info to the user
          console.log(games);
          ws.send(message);
        }
        break;
      case Header.JOIN:
        console.log("request to join game");
        const clientID = messageToJSON.clientID.toString();
        const gameID = messageToJSON.gameID.toString();
        
        //check if the game exists
        let game = games[gameID];
        console.log("GAMES");
        console.log(game);
        try {
          if(!game){
            broadcast(ws,invalidGameID());
            return;
          }
          else {
            game.players.push(clientID);
            console.log(`game.players.length ${  game.players.length }`)
            console.log(`num_players ${game.num_players}`)
            if (game.players.length === game.num_players) {
              //play
              const msg = {
                header: Header.START_GAME,
                playing: true,
                multiplayer: true,
              };
              console.log("HERE");
              console.log(game);
              broadcast(ws, JSON.stringify(msg));
              return;
            }
            console.log(`waiting for the other ${game.num_players - game.players.length} players!`);
      
          }
        } catch (error) {
          console.log(error);
        }

        break;
      case Header.PLAY:
        //broadcast client message to everyone        
        broadcastNotYou(ws, message);
        break;
      case Header.POWER:
        console.log(messageToJSON)
        broadcastNotYou(ws,hardDrop())
        break;
      case Header.PUNISH:
        console.log(messageToJSON)
        broadcastNotYou(ws,punishmentLine())
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
    let msg = { header: Header.QUIT, clientID: newClient };
    //notify everyone tha the client dropped the connection
    const message = JSON.stringify(msg);
    broadcast(ws, message);
    removeClient(newClient);
  });
});
