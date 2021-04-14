import { SQ, ROW, COL, getColor} from "../assets/assets";
import {gameStatus} from '../app'
import { drawGameBoard, eraseGameBoard, drawPiece } from '../app'

// -- Server -- Server -- Server -- Server -- Server -- Server -- Server //
export const ws = new WebSocket("ws://localhost:8080");
export let contenders:any = [];
const contendersBox = document.querySelector('.contenders')!;


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
  else{
    try {
      const contenderData = JSON.parse(data);
      // console.log(contenderData);
      const contenderID = contenderData.clientID;
      if(contenders.length !== 0){
        if(isContenderAlreadyPlaying(contenderID) === -1){
          //contender is not playing yet
          //add contender to the array 
          contenders.push(contenderData);
          //draw contenders and include the new contender
          drawContenders(contenders);
        }
        else{
          //contender is already playing
          console.log(`contender is already playing: NOT ADDED`);
          //update contender data in the HTML and array
        }
        
      }else{
        //first contender in the list
         contenders.push(contenderData);
         drawContenders(contenders);         
       }
       console.log(contenders)

      //check if the ID of these data received already exist in the array of values 
    } catch (e) {
      return;
    }
  }
});

ws.addEventListener("close", () => {
  console.log("desconnected from the server");
});

const rivalTemplate = (data:any) => {
  // console.log(data)
  const test = 1;
  const markup = `
              <article id="${data.clientID}" class="contender">
                  <h5 class="contender__name">${data.records._player}</h5>
                  <canvas id="contender__canvas-${data.clientID}" class="contender__canvas" style="background-color: black;"></canvas>
                  <div class="contender__records">
                      <p class="contender__records-score">score:   <strong>${data.records._score}</strong></p>
                      <p class="contender__records-lines">lines:   <strong>${data.records._lines}</strong></p>
                      <p class="contender__records-status">status: <strong>${test}</strong></p>
                  </div>
              </article>   
  `
  contendersBox.insertAdjacentHTML('afterbegin', markup);
  
  // PROBABLY A NEW FUNCTION WOULD BE GREAT
  const player = document.querySelector(`#contender__canvas-${data.clientID}`)! as HTMLCanvasElement;
  console.log(player)
  let width = document.createAttribute("width");
  let height = document.createAttribute("height");
  width.value = (COL * (SQ / 2)).toString();
  height.value = (ROW * (SQ / 2)).toString();
  // Set the height and width of the class attribute
  player.setAttributeNode(width);   
  player.setAttributeNode(height);
  
  let ctxRival = player.getContext("2d") as CanvasRenderingContext2D;
      ctxRival.scale(0.5,0.5)
  eraseGameBoard(ctxRival,ROW,COL);
  drawGameBoard(ctxRival,ROW,COL);

  console.log(data.piece._activeTetrominoe)
  /// YOU LEFT IF HERE
  // PROBLEMS WITH THE GAME OVER
  // CONSIDER MOVING THIS FUNCTION TO THE APP.JS

} 

const drawContenders = (contenders:any[]) => {  
  contenders.forEach(contender => {
    rivalTemplate(contender);
  })

}
/*
const drawOpponents = (opponent?:any) => {
    ctxRival = rivalCanvas.getContext("2d") as CanvasRenderingContext2D;
    ctxRival.scale(0.5,0.5)
    eraseGameBoard(ctxRival,ROW,COL);
    drawGameBoard(ctxRival,ROW,COL);
    drawPiece(ctxRival,opponent.piece)
  }
  else{
    console.log('player already exists')
    //repace the node and update the new
    
  }
  
  
}
*/

const isContenderAlreadyPlaying = (rivalID:string) => {
  //if return is -1 then player is not in the array
  // console.log(`isContenderAlreadyPlaying()`);
  let index:number;
  //check in the array of contenders if the player is already in the array
  for(let i = 0; i < contenders.length; i++){
    //select contender object 
    const contender = Object.entries(contenders[i]);
    // analise contender data
    for(let j = 0; j < contender.length; j++){
      const key = contender[j][0];
      const val = contender[j][1];
      if(key === 'clientID'){
        //clienID is the key we need to check
        console.log(`key: ${key}, val: ${val}, index: ${i}`);
        if(val === rivalID) {
          //if the key value is equals to the one passed as a parameter then, it means that the rival is already playing 
          index = i;
          console.log(`index: ${index}`)
          //we will need its index in the list so we can modify that data later on
          return index
        }
        else{
          index = -1;
          console.log(`index: ${index}`)
          return index
        };        
      };

    }
  }

}

export const sendGameStatus = (status: any) => {
  //send all of the necesary data to the server
    if (status) {
      const data = JSON.stringify(status);
      ws.send(data);
    }
};
