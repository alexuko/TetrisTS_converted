import { SQ, ROW, COL, getColor } from "../assets/assets";
import { gameStatus } from "../app";
import { drawGameBoard, eraseGameBoard, drawPiece } from "../app";
import { clonePiece } from "../classes/piece";

// -- Server -- Server -- Server -- Server -- Server -- Server -- Server //
export const ws = new WebSocket("ws://localhost:8080");
let contenders:string[] = [];
const contendersBox = document.querySelector(".contenders")!;

ws.addEventListener("open", () => {
  console.log("Ready to rock you are connected");
});

ws.addEventListener("close", () => {
  console.log("desconnected from the server");
});

ws.addEventListener("message", (msgRecv) => {
  const data = msgRecv.data;
  //If the string received from server is > 20 && < 40, then that's the UUID
  try {

    if (data.length < 40 && data.length > 20) {
      gameStatus.clientID = msgRecv.data;     
      console.log(gameStatus.clientID)
    }
    else{
      const contenderData = JSON.parse(data);
      //get the ID so we can check if the client is already in the list of playeres
      const contenderID:string = contenderData.clientID;
      //get the index of the player, if not existent then returns -1
      const indexContender = isContenderInTheArray(contenderID);
      let rivalHTML:HTMLCanvasElement;

      //if this is the first player in the array or the player is not in the array then add it
      if (contenders.length === 0 || indexContender === -1) {
        console.log(`NEW contender!`);
        contenders.push(contenderID);
        rivalHTML = newRivalPlayground(contenderData)
        buildRivalGame(rivalHTML,contenderData,true);
      } else {
        // console.log(`contender is already playing: Replacing new data`);
        rivalHTML = getContenderHTMLelement(contenderID);
        buildRivalGame(rivalHTML,contenderData,false);
      }

      // drawContenders(contenders);
    }
    return;
  } catch (e) {
    console.log('something happen: '  +  e)
  }
});



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
  const test = 1;
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
                        <strong class="contender__records-status">${test}</strong>
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

function updateRecords(rivalHTML: HTMLCanvasElement,data:any) {
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

const isContenderInTheArray = (rivalID: string) => {
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






