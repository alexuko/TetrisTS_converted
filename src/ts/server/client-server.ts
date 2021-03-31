import Gameboard from "~ts/classes/gameBoard";
import Piece from "~ts/classes/piece";
import Records from "~ts/classes/records";

// -- Server -- Server -- Server -- Server -- Server -- Server -- Server //
const ws = new WebSocket('ws://localhost:8080');        
     
ws.addEventListener('open', () => {
    console.log('Ready to rock you are connected')        
    
})

ws.addEventListener('message', msgRecv => {
    console.log(`Message from Server, Received!`)
    // console.log(msgRecv)
    try{
        const dataReceived = JSON.parse(msgRecv.data);
        console.log(dataReceived);        
    }catch(e){
        return;
    }
})


ws.addEventListener('close', () => {
    console.log('desconnected from the server')
})


export const sendGameStatus = (status:any) => {
    //send all of the necesary data to the server
    if(status){
        const data = JSON.stringify(status)
        ws.send(data);  
    }
}
