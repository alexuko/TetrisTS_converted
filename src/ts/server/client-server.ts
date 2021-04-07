import {gameStatus} from '../app'

// -- Server -- Server -- Server -- Server -- Server -- Server -- Server //
export const ws = new WebSocket("ws://localhost:8080");

// export const startClientConnection = () => {
ws.addEventListener("open", () => {
  console.log("Ready to rock you are connected");
});

ws.addEventListener("message", (msgRecv) => {
  const data = msgRecv.data;
  //If the string received from server is > 20 && < 40, then that's the UUID  
  if(data.length < 40 && data.length > 20){
    gameStatus.clientID = msgRecv.data;
    console.log(gameStatus)
  }
  // }
  // console.log(msgRecv)
  try {
    const dataReceived = JSON.parse(data);
    console.log(dataReceived);    
    
  } catch (e) {
    return;
  }
});



ws.addEventListener("close", () => {
  console.log("desconnected from the server");
});
// }



export const sendGameStatus = (status: any) => {
  //send all of the necesary data to the server
    if (status) {
      const data = JSON.stringify(status);
      ws.send(data);
    }
};
