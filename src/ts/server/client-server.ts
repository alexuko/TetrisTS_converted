import { SQ, ROW, COL, getColor } from "../assets/assets";
import { gameStatus } from "../app";
import { drawGameBoard, eraseGameBoard, drawPiece } from "../app";
import { clonePiece } from "../classes/piece";
import { Header } from "../assets/assets";
// -- Server -- Server -- Server -- Server -- Server -- Server -- Server //
let contenders:string[] = [];
const contendersBox = document.querySelector(".contenders")!;

export const connection = () => {
  return new WebSocket("ws://localhost:8080");
}

let ws:WebSocket = connection();


ws.addEventListener("open", () => {
  console.log("Ready to rock you are connected");
});

ws.addEventListener("close", () => {
  console.log("desconnected from the server");
});

ws.addEventListener("message", msgRecv => {
  console.log('msgRecv')
  const data = msgRecv.data
  const dataToJSON = JSON.parse(data)
  const header = dataToJSON.header;
  const message = dataToJSON.message;
  console.log(header)
  switch(header){
    case Header.CONNECT:
      //this will save the client ID
      console.log(`Message received from server, This is your ID: ${message}`)
      gameStatus.clientID = message; 
      console.log(`Status: ID: ${gameStatus.clientID}`)
      break;
    case Header.NEWGAME:
      //request the server to create a new game
      break;  
      case Header.JOIN:
      //request the server to join game
      //send the game id you wanna join
      break;  
    case Header.PLAY:
      //send your game status to the server
      drawContender(data);
      break;  
    case Header.QUIT:
      //tell server that you have lost
      const contenderID:string = dataToJSON.clientID;
      const index = getContenderIndex(contenderID);
      removeContender(contenders,index,contenderID);        
      break;  
    default:
      console.log('Unknown action')
  }

});

const drawContender = (data:any) => {
   try {
      const contenderData = JSON.parse(data);
      //get the ID so we can check if the client is already in the list of playeres
      const contenderID:string = contenderData.clientID;
      //get the index of the player, if not existent then returns -1
      const indexContender = getContenderIndex(contenderID);
      let rivalHTML:HTMLCanvasElement;
      
      //if this is the first player in the array or the player is not in the array then add it
      if (contenders.length === 0 || indexContender === -1) {
        //NEW contender!
        contenders.push(contenderID);
        //built contender's html and fill it in with data
        rivalHTML = newRivalPlayground(contenderData)
        buildRivalGame(rivalHTML,contenderData,true);
      
      } else {
        // contender is already playing: Replacing it with new data
        rivalHTML = getContenderHTMLelement(contenderID);
        buildRivalGame(rivalHTML,contenderData,false);
        // if(contenderData.lost === true) removeContender(contenders,indexContender,contenderID);
      }

    return;
  } catch (e) {
    console.log('something happen: '  +  e)
  }
}

const removeContender = (contenders: string[], indexContender: number, contenderID: string) => {
  console.log(`removeContender from the UI`)
  try{
    // remove it from the array of contenders
    contenders.splice(indexContender,1)
    //remove it from the node of contenders
    const child = getContenderHTMLelement(contenderID);
    //get child's parent
    const parent = child.parentNode;
    //if parent exist then remove child
    if(parent) parent.removeChild(child);

  }catch(error){
    console.log( `something went wrong deleting contender ${error}`)
  }

  
}

const getContenderHTMLelement = (ID:string) => {
  // console.log(`getContenderHTMLelement`)
  let myNodeList = document.querySelectorAll("article.contender");
  let rivalCanvas:any = null;
  myNodeList.forEach(contender => {
    if(contender.id === ID){
      rivalCanvas = contender;  
    }
    else rivalCanvas;
  })

  return rivalCanvas;
}

const newRivalPlayground = (data: any) => {
  // console.log(data)
  const showContenderIn_UI = 1;
  const markup = `
            <article id="${data.clientID}" class="contender">
                <h5 class="contender__name">${data.records._player}</h5>
                <canvas id="contender__canvas-${data.clientID}" class="contender__canvas" style="background-color: black;"></canvas>
                <div class="contender__records">
                    <div class="record">
                        <p>score:</p>
                        <strong class="contender__records-score">${data.records._score}</strong>                        
                    </div>
                    <div class="record">
                        <p>lines:</p>
                        <strong class="contender__records-lines">${data.records._lines}</strong>
                    </div>
                    <div class="record">
                        <p>status:</p>
                        <strong class="contender__records-status">${showContenderIn_UI}</strong>
                    </div>
                </div>
            </article>
  `;
  contendersBox.insertAdjacentHTML("beforeend", markup);

  // PROBABLY A NEW FUNCTION WOULD BE GREAT
  const rival = document.querySelector(
    `#contender__canvas-${data.clientID}`
  )! as HTMLCanvasElement;
  return rival;
};

const updateRecords = (rivalHTML: HTMLCanvasElement,data:any) => {
  let canvas:any
  //update player name
  let player = rivalHTML.children.item(0)!;
  player.textContent = data.records._player
  
  
  //get records node   
  let records = rivalHTML.children.item(2);

  //update score
  let score = records?.children.item(0)!.children.item(1)!;
  score.textContent = data.records._score;
  
  //update lines  
  let lines = records?.children.item(1)!.children.item(1)!;
  lines.textContent = data.records._lines;
  
  //update status  
  let text = '';
  data.lost === false ? text = 'playing' : text = 'lost'  
  let status = records?.children.item(2)!.children.item(1)!;
  status.textContent = text.toUpperCase();
  
  // get the canvas
  rivalHTML.childNodes.forEach(el => {
    if(el.nodeName === "CANVAS") canvas = el
  })
  
  return canvas;
}

const buildRivalGame = (rivalHTML:HTMLCanvasElement, data:any, isNewPlayer:boolean) => {
  let ctxRival:CanvasRenderingContext2D;
  // console.log(data)
  if(isNewPlayer){
    let width = document.createAttribute("width");
    let height = document.createAttribute("height");
    width.value = (COL * (SQ / 2)).toString();
    height.value = (ROW * (SQ / 2)).toString();
    // Set the height and width of the class attribute
    rivalHTML.setAttributeNode(width);
    rivalHTML.setAttributeNode(height);
    ctxRival = rivalHTML.getContext("2d") as CanvasRenderingContext2D;
    ctxRival.scale(0.5, 0.5);
  }
  else{
    const canvas = updateRecords(rivalHTML,data) as HTMLCanvasElement;    
    ctxRival = canvas.getContext("2d") as CanvasRenderingContext2D;       
  }
  
  eraseGameBoard(ctxRival, ROW, COL);
  drawGameBoard(data.gameboard, ctxRival, ROW, COL);
  //Note:  clone a pice was necesary to execute drawPiece()
  let rivalPiece = clonePiece(data.piece);
  drawPiece(ctxRival, rivalPiece, data.gameboard);
};

const getContenderIndex = (rivalID: string) => {
  let index = -1;
  //check in the array of contenders if the player is already in the array
  for (let i = 0; i < contenders.length; i++) {
    const element = contenders[i];
    if(element === rivalID) index = i;    
  }
  //if return is -1 then player is not in the array
    return index;
};

export const sendGameStatus = (status: any) => {
  //send all of the necesary data to the server
  if (status) {
    const data = JSON.stringify(status);
    ws.send(data);
  }
};

export const closeConnection = () => {
  ws.close(1000,'Player lost then a new connection is required')  
}

