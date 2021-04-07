import tetrominoes from "./assets/tetrominoes";
import { SQ, ROW, COL, getColor, mod } from "./assets/assets";
import Gameboard from "./classes/gameBoard";
import Brush from "./classes/brush";
import Records from "./classes/records";
import Piece from "./classes/piece";
import * as tests from "./assets/SRS_offsets";
import * as clientServer from "./server/client-server";
import * as localStorage from './server/localStorage';

let score: number,
  player: string,
  lines: number,
  level: number,
  speed: number = 0,
  gameBoard: number[][],
  brush: Brush,
  piece: Piece,
  lockedPiece: boolean,
  records: Records,
  nextPiece: Piece | null = null,
  gamePaused: boolean,
  gameOver = true,
  spinPoints = 0,
  start = Date.now(),
  sendToServer: NodeJS.Timeout,
  nextPieceCanvas:HTMLCanvasElement,
  NPctx:CanvasRenderingContext2D,
  GBcanvas:HTMLCanvasElement,
  GBctx:CanvasRenderingContext2D,
  opponents: any = [];
  
const empty = 0;
// Tuple use to represent  a pair of a string and a number (in that order ONLY)
type Path = [string, number];
//String Literal Type so not other string than the ones within Pathway will be accepted
type Pathway = "up" | "down" | "left" | "right" | "rotate";
/**
 * State of the game
 * This data will be send to the server
 */
export let gameStatus: any = {};

const formValues = document.querySelectorAll(".input-value")! as NodeListOf<HTMLInputElement>;
const playBtn = document.querySelector(".submit-btn")! as HTMLInputElement;
const backdrop = document.querySelector(".backdrop")! as HTMLElement;



const pauseButton = document.querySelector('#play-pause')! as HTMLButtonElement;

const drawOpponents = () => {
  opponents = document.querySelectorAll('.contender')!;
  console.log(opponents);
}

const pauseGame = () => {  
  //change status of the game with event listener
  gamePaused = !gamePaused;
  //change button dialog
  let buttonState = '';
  if(gamePaused){//if game on paused   
    pauseButton.classList.remove('btn-pause')
    buttonState = 'Play';
    pauseButton.classList.add('btn-play')
    //stop sending data to the server
    stopSendingData();
  }  
  else{ //if Playing
    pauseButton.classList.remove('btn-play')
    buttonState = 'Pause';
    pauseButton.classList.add('btn-pause')
    //restart sending data to the server
    startSendingData();
    update();
  }
  //set UI button status
  pauseButton.textContent = buttonState.toUpperCase();

} 
const startGame = (e: any) => {
  e.preventDefault();
  const arr = Array.from(formValues).map((el) => el.value);
  const playerName: string = !arr[0] ? "unknown" : arr[0];
  const playerLevel: number = parseInt(arr[1]);
  speed = playerLevel;
  console.log(
    `playerName: ${playerName} \nplayerLevel: ${playerLevel} \nspeed: ${speed} `
  );
  //   console.log(speed)
  backdrop.style.display = "none";
  init(playerName, speed);  
  
};

const init = (name: string, selectedLevel: number) => {
  //NextPiece Canvas 
  nextPieceCanvas = document.querySelector("canvas#nextPiece") as HTMLCanvasElement;
  NPctx = nextPieceCanvas.getContext("2d")! as CanvasRenderingContext2D;
  //Gameboard Canvas
  GBcanvas = document.querySelector("canvas#tetris") as HTMLCanvasElement;
  GBctx = GBcanvas.getContext("2d") as CanvasRenderingContext2D;
  GBcanvas.width = COL * SQ;
  GBcanvas.height = ROW * SQ;
  //
  let GB = new Gameboard(ROW, COL);
  gameBoard = GB.createGameBoard();
  brush = new Brush(SQ);
  gameOver = false;
  records = new Records(name, selectedLevel);
  records.setInitialUIvalues();
  drawGameBoard(GBctx, ROW, COL);
  piece = getRandomPiece();
  drawPiece(GBctx, piece);
  getNextPiece();
  score = records.score;
  lines = records.lines;
  level = records.level;
  player = records.player;
  speed = selectedLevel;
  //update high scores table
  // localStorage.updateScoreTable();
  //initialize game status
  gameStatus.piece = piece;
  gameStatus.records = records;
  gameStatus.gameboard = gameBoard;
  startSendingData();
  update();
  // drawOpponents();
};

const moveTowards = (dir: Pathway): Path => {
  let path: Path;
  if (dir === "up") path = ["up", -1];
  else if (dir === "right") path = ["right", 1];
  else if (dir === "left") path = ["left", -1];
  else if (dir === "down") path = ["down", 1];
  else path = ["rotate", 0];

  return path;
};

const drawGameBoard = (
  ctx: CanvasRenderingContext2D,
  rows: number,
  cols: number
) => {
  //iterate through all rows

  for (let r = 0; r < rows; r++) {
    //now iterate through each column from each row
    for (let c = 0; c < cols; c++) {
      // and then, draw a square
      const color = getColor(gameBoard[r][c]);
      // console.log(color)
      brush.drawSquare(ctx, c, r, color);
    }
  }
};

const eraseGameBoard = (
  ctx: CanvasRenderingContext2D,
  rows: number,
  cols: number
) => {
  //iterate through all rows

  for (let r = 0; r < rows; r++) {
    //now iterate through each column from each row
    for (let c = 0; c < cols; c++) {
      // and then, draw a square
      // const color = getColor(gameBoard[r][c]);
      // console.log(color)
      brush.undrawSquare(ctx, c, r);
    }
  }
};

const drawPiece = (ctx: any, currentPiece: Piece) => {
  try {
    // let count = 0;
    currentPiece.activeTetrominoe.forEach((row: number[], rIndex: number) => {
      row.forEach((col: number, cIndex: number) => {
                     
        //if there is a "NUMBER" in the currentPiece matrix
        if (currentPiece.activeTetrominoe[rIndex][cIndex]) {
          //check if coordinates on gameboard are not empty
          //and if there is a piece or piece spawned over the limit then game is over
          if (gameBoard[currentPiece.y + rIndex][currentPiece.x + cIndex] !== empty || 
            gameBoard[currentPiece.y + rIndex][currentPiece.x + cIndex] === undefined) 
            {
              // count++;
              // console.log(count);
              if(!gameOver){
                gameIsOver();        
              }
              
            }

          //draw a square even if the piece is out of bounds. This is just for styling 
            brush.drawSquare(ctx, currentPiece.x + cIndex, currentPiece.y + rIndex, currentPiece.color );
          }
          //get off the loop    
          if (gameOver === true) return;      
      });

    });
  } catch (e) {
    // console.error("error drawing the currentPiece: " + e);
    gameIsOver();
    return;
  }
};

const gameIsOver = () => {
    //set the gameover flag to true
    gameOver = true;
    // alert("GAME OVER !");
    //save records in the local storage    
    const res = localStorage.saveToLocalStorage()!;
    if (res === 1) localStorage.compareScores();
    
    //update UI for the records
    // localStorage.updateScoreTable();
    //*****************************/
    //show to the player that the game is over
    //display the backdrop menu again
    backdrop.style.display = 'flex';            
    // so this does not overdraw the previous currentPiece
    
}


const erasePiece = (ctx: CanvasRenderingContext2D, currentPiece: Piece) => {
  //iterate through current currentPiece
  try {
    currentPiece.activeTetrominoe.forEach((row: number[], rIndex: number) => {
      row.forEach((col: number, cIndex: number) => {
        //if there is a "number in the tetrominoe matrix e.g. 1"
        if (currentPiece.activeTetrominoe[rIndex][cIndex]) {
          //first completly delete the square from the GB
          brush.undrawSquare(
            ctx,
            currentPiece.x + cIndex,
            currentPiece.y + rIndex
          ); //draw a square
          //this will draw a black square (available space) in the current position
          brush.drawSquare(
            ctx,
            currentPiece.x + cIndex,
            currentPiece.y + rIndex,
            getColor(0)
          ); //draw a square
        }
      });
    });
  } catch (e) {
    console.error("error erasing the piece: " + e);
  }
};

const checkFullRows = () => {
  let fullRows = 0;
  // iterate every row in the GB from bottom up
  for (let r = ROW - 1; r >= 0; r--) {
    // occupied will work as a counter
    let occupied = 0;
    //check every col from each row in matrix
    for (let c = 0; c < COL; c++) {
      // if there is an empty space on the row, then break and check next row,
      // this will optimise time taken on checking rows
      if (gameBoard[r][c] === empty) break;
      //otherwise it will add 1 to our counter
      occupied++;
      //if 10 not empty spaces within a row are found then there's a complete row
      if (occupied === COL) {
        // increment Global number of rows counter
        fullRows += 1;
        //pull rows down from the place where the full row was found
        pullRowsDown(r);
        // apply this concurrent method to check for more full rows if any
        checkFullRows();
      }
    }
  }
  // change the score if achieved new lines
  if (fullRows > 0) {
    lines += fullRows;
    spinPoints = spinPoints <= 0 ? 1 : spinPoints;
    fullRows < 4
      ? (score += fullRows * 100 * spinPoints)
      : (score += fullRows * 200 * spinPoints);
    console.log(`lines:${fullRows}, score:${score}, spinPoints:${spinPoints}`);
    records.setLines(lines);
    records.setScore(score);
    speed = setSpeed(lines, level);
    level = records.setLevel(speed);
    console.log(`level: ${level} speed: ${speed} lines: ${lines}`);
    spinPoints = 0;    
    
  }
};

const setSpeed = (linesCompleted: number, level: number) => {
  // 5 - 1 = 4/10
  const levelCompleted = 10;
  if (linesCompleted <= 0) return 1;
  //if modulo is zero then increment level by one, otherwise just return current level
  return linesCompleted % levelCompleted !== 0 ? speed : speed += 1;
  
};

const pullRowsDown = (from: number) => {
  // console.log(`pullRowsDown() ${from}`)
  // iterate every row in the GB from bottom up
  for (let r = from; r >= 0; r--) {
    for (let c = 0; c < COL; c++) {
      //if row has a preceding row then switch current row by the preceding one
      //then if the row is the first row (0) then there is no rows before,
      // so we set to zeros the entire row
      r > 0 ? (gameBoard[r][c] = gameBoard[r - 1][c]) : (gameBoard[r][c] = 0);
    }
  }
  // console.table(gameBoard)
};

const merge = () => {
  try {
    //check tetrominoe matrix (rows and cols)
    //first loop through all of the rows
    for (let r = 0; r < piece.activeTetrominoe.length; r++) {
      //for each row loop through all of the columns
      for (let c = 0; c < piece.activeTetrominoe[r].length; c++) {
        //if a empty space is found then omit
        if (!piece.activeTetrominoe[r][c]) continue;
        //merge tetrominoe matrix with GB matrix
        gameBoard[piece.y + r][piece.x + c] = piece.activeTetrominoe[r][c];
      }
    }
  } catch (e) {
    //this error will pop out if a problem with merging the piece
    //most likely when piece merges out of bounds ( negative rows)
    console.error("Error merging the piece: " + e);
  }
};

const moveDown = () => {
  // debugger;
  if (!collision(moveTowards("down"))) {
    erasePiece(GBctx, piece);
    piece.moveTo(moveTowards("down"));
    drawPiece(GBctx, piece);
  } else {
    merge();
    checkFullRows();
    drawGameBoard(GBctx, ROW, COL);
    lockedPiece = true;
    piece = getRandomPiece();
    drawPiece(GBctx, piece);
    getNextPiece();
  }
};

const hardDrop = () => {
  // console.log(`hard drop`)
  //get tetrominoe last occupied positions in its matrix (row and col)
  const tetroLastCol = piece.lastOccupiedRowOrCol(false);
  const tetroLastRow = piece.lastOccupiedRowOrCol(true);
  // set to false so se can unlock the piece and drop it
  lockedPiece = false;
  // r = starting from where piece spawns y + the last tetrominoe occupied row + 1 as arrays are zero based
  // iterate until last row of the gameboard
  for (let r = piece.y + tetroLastRow + 1; r <= ROW - 1; r++) {
    // c = starting from where piece spawns x + + the last tetrominoe occupied col
    for (let c = piece.x; c <= piece.x + tetroLastCol; c++) {
      // console.log(`row: ${r} col: ${c}`)
      // if the piece has not been locked then keep moving down
      if (!lockedPiece) moveDown();
      // if piece is lock, leave loop
      else break;
    }
  }
};

const moveRight = (rotateAction = false) => {
  //check if there is no collision, if there's no,then move tetrominoe to the right 1 space
  if (!rotateAction) {
    if (!collision(moveTowards("right"))) {
      //check if there is no collision and if there is not,
      erasePiece(GBctx, piece);
      piece.moveTo(moveTowards("right"));
      drawPiece(GBctx, piece);
    }
  } else {
    piece.moveTo(moveTowards("right"));
    return;
  }
};

const moveLeft = (rotateAction = false) => {
  //check if there is no collision, if there's no,then move tetrominoe to the left 1 space
  if (!rotateAction) {
    if (!collision(moveTowards("left"))) {
      erasePiece(GBctx, piece);
      // if (!this.hitWall(DIRECTION.left)) {
      piece.moveTo(moveTowards("left"));
      drawPiece(GBctx, piece);
    }
  } else {
    piece.moveTo(moveTowards("left"));
    return;
  }
};

const rotate = (clockwise: boolean, rotTimes: number = 0) => {
  try {
    // console.log(`***** START *****`)
    // console.log(`Rotation-times: ${rotTimes}`)

    const initialPosition = piece.position;
    const initial_X = piece.x;
    const initial_Y = piece.y;
    // console.log(`initpos: ${initialPosition}, initX:${initial_X}, initY:${initial_Y}`)

    // Check if the piece will rotate clockwise or counterclockwise
    let rotation = clockwise ? 1 : -1;
    // If this is the first time that the piece rotates then erase the piece
    if (rotTimes === 0) erasePiece(GBctx, piece);
    // Increment the number of rotation times by 1
    rotTimes++;
    // console.log('rotTimes:' + rotTimes);
    //get next position of the tetrominoe (clockwise | counterclockwise)
    piece.position = mod(piece.position + rotation, piece.tetrominoe.length);
    // console.log(`newPos: ${piece.position}, initX:${initial_X}, initY:${initial_Y}`)
    // get the position from the original tetrominoe and pass it to the active tetrominoe
    // piece._activeTetrominoe = piece.tetrominoe[piece.position];
    piece.activeTetrominoe = piece.tetrominoe[piece.position];
    // Check if the piece overlapped with the wall, if it did then call wallkick()
    // Arrange the piece to a correct place within the gameboardlines
    if (collision(moveTowards("rotate"))) wallKick();
    // Now check that pieces do not overlap
    if (!piecesOverlapped()) {
      drawPiece(GBctx, piece);
      return;
    }
    //if pieces overlapped then
    // Check that piece did not overlapped with another piece after rotation
    let result = SRS(initial_X, initial_Y, clockwise, rotTimes);

    //if results are the same than when piece overlapped, ALL tests in SRS failed, then, DO NOT rotate piece
    if (result[0] === initial_X && result[1] === initial_Y) {
      piece.position = initialPosition;
      piece.x = initial_X;
      piece.y = initial_Y;
      // console.log(`allFailpos: ${piece.position}, allFailX:${initial_X}, allFailY:${initial_Y}`)
    } else {
      //position was already changed and new values are assigned to X & Y
      piece.position;
      piece.x = result[0];
      piece.y = result[1];
    }
    // Once piece does not overlap then redraw piece on the Gameboard
    console.log(
      `FINAL position: ${piece.position}, X:${piece.x}, Y:${piece.y}`
    );
    drawPiece(GBctx, piece);
  } catch (e) {
    console.error(`There was an error roating the piece ${e}`);
  }
};

const SRS = (
  xVal: number,
  yVal: number,
  clockwise: boolean,
  rotaTimes: number,
  testTimes?: number
) => {
  let count = !testTimes ? 0 : testTimes;

  if (rotaTimes > 4) return [xVal, yVal];

  let offsets: number[][] = [];
  //J, L, S, T, Z tetrominoes
  if (piece.number !== 6) {
    if (clockwise) {
      if (piece.position === 0) offsets = tests.offset1;
      if (piece.position === 1) offsets = tests.offset2;
      if (piece.position === 2) offsets = tests.offset3;
      if (piece.position === 3) offsets = tests.offset4;
    } else {
      if (piece.position === 3) offsets = tests.offset4;
      if (piece.position === 2) offsets = tests.offset3;
      if (piece.position === 1) offsets = tests.offset2;
      if (piece.position === 0) offsets = tests.offset1;
    }
  } else {
    //is I tetrominoe
    if (clockwise) {
      if (piece.position === 0) offsets = tests.offset5;
      if (piece.position === 1) offsets = tests.offset6;
      if (piece.position === 2) offsets = tests.offset7;
      if (piece.position === 3) offsets = tests.offset8;
    } else {
      if (piece.position === 0) offsets = tests.offset6;
      if (piece.position === 3) offsets = tests.offset5;
      if (piece.position === 2) offsets = tests.offset8;
      if (piece.position === 1) offsets = tests.offset7;
    }
  }

  piece.x += offsets[count][0];
  piece.y += offsets[count][1];
  // console.log(`piece after offset x:${piece.x}, y:${piece.y}  `)

  if (piecesOverlapped()) {
    count++; //increment 1 to the count
    piece.x = xVal; //set the original X value to reevaluate
    piece.y = yVal; //set the original Y value to reevaluate

    if (count < offsets.length) {
      SRS(piece.x, piece.y, clockwise, rotaTimes, count); //same test, next index
    } else {
      count = 0; // set count to zero and so next test is evaluated from the beginning
      if (rotaTimes < offsets.length) rotate(clockwise, rotaTimes);
      else return [xVal, yVal]; // all test were evaluated, then return original values
    }
  }
  // e.g. 0 + 1 = (1 * 1) * 10 = 10;
  // e.g. 1 + 1 = (2 * 2) * 10 = 40;
  // e.g. 2 + 1 = (3 * 3) * 10 = 90;
  // e.g. 3 + 1 = (4 * 4) * 10 = 160; //Max spin points
  spinPoints = (count + 1) * rotaTimes * 10;
  console.log("spin:" + spinPoints);
  //is piece did not overlapped then return the translated coordinates
  return [piece.x, piece.y];
};

const piecesOverlapped = () => {
  try {
    let new_x, new_y;
    for (let r = 0; r < piece.activeTetrominoe.length; r++) {
      //loop through all of the rows
      for (let c = 0; c < piece.activeTetrominoe[r].length; c++) {
        //for each row loop through all of the columns
        if (!piece.activeTetrominoe[r][c]) continue; // skip zeros in the tetrominoe matrix
        new_x = piece.x + c; // New x (column) position from each square of the tetrominoe
        new_y = piece.y + r; // New y (row)    position from each square of the tetrominoe
        // test to check all of the new positions
        // console.log(` gameboard: ${gameBoard[new_y][new_x]}, newX: ${new_x}, newY: ${new_y} `)
        // if any of the squares lands on a non empty position in the board then, it overlapped
        // or piece
        // If its not = 0
        if (
          gameBoard[new_y][new_x] === undefined ||
          gameBoard[new_y][new_x] !== empty || // if square set in a occupied or undefined space (beyond gameboard)
          new_y < 0 ||
          new_y > ROW - 1 || // if piece goes beyond ceiling or floor
          new_x < 0 ||
          new_x > COL - 1
        ) {
          // if piece goes beyond walls
          console.log("pieces overlapped");
          return true;
        }
      }
    }
    // console.log('does not overlap')
    // Piece did not overlapped
    return false;
  } catch (e) {
    console.warn(
      `There was an error while checking if pieces overlapped: ${e}`
    );
    return true;
  }
};

const collision = (dir: Path) => {
  // console.log('**********************')
  for (let r = 0; r < piece.activeTetrominoe.length; r++) {
    //loop through all of the rows
    for (let c = 0; c < piece.activeTetrominoe.length; c++) {
      //for each row loop through all of the columns
      if (!piece.activeTetrominoe[r][c]) continue; // skip zeros in the tetrominoe matrix
      // get new X coordinates for each block of the tetrominoe
      let xCoord = piece.x + c;
      let yCoord = piece.y + r;
      try {
        if (dir[0] === "rotate") {
          //check for collision on rotation
          // For testing
          // console.log('Now')
          // console.log(`yC:${yCoord} xC:${xCoord}`)
          // console.log('board '+ (gameBoard[yCoord][xCoord] !== empty))
          // Check if any SQUARE that builds up the tetrominoe is out of bounds
          // or overlaps an already occupied space
          if (yCoord < 0 || yCoord >= ROW || xCoord < 0 || xCoord >= COL) {
            console.warn(`Collided`);
            return true;
          }
        } else if (dir[0] === "down") {
          // Direction is DOWN then check "Y" limits
          // Add the direction value to the yCoord (1 OR -1) we wanna move to,
          // So we can check if that space within the gameboard is either occupied Or out of bounds.
          yCoord += dir[1];
          // Direction is DOWN then check "Y" limits
          if (yCoord >= ROW || gameBoard[yCoord][xCoord] !== empty) return true; //reached the limit, is has collided
          if (yCoord <= ROW) continue; // current square from tetrominoe is ok. So check NEXT
        } else {
          // Direction is either LEFT or RIGHT then check "X" limits
          // Add the direction value to the xCoord (1 OR -1) we wanna move to,
          // So we can check if that space within the gameboard is either occupied Or out of bounds.
          xCoord += dir[1];
          // if (gameBoard[yCoord][xCoord] === undefined || gameBoard[yCoord][xCoord] !== empty) return true;
          if (
            xCoord < 0 ||
            xCoord >= COL ||
            gameBoard[yCoord][xCoord] !== empty
          )
            return true;
          if (xCoord > 0 || xCoord < COL) continue;
        }
      } catch (error) {
        if (yCoord > -3) continue;
        console.log("Out of Bounds");
        return true;
      }
    }
  }
  return false; // if no collision then if ok to move tetrominoe
};

const wallKick = () => {
  let r,
    c,
    new_x,
    new_y,
    calc,
    Xoffset = 0,
    Yoffset = 0;

  for (r = 0; r < piece.activeTetrominoe.length; r++) {
    //loop through all of the rows
    for (c = 0; c < piece.activeTetrominoe[r].length; c++) {
      //for each row loop through all of its columns
      if (!piece.activeTetrominoe[r][c]) continue; // skip zeros in the tetrominoe matrix
      new_x = piece.x + c;
      new_y = piece.y + r;

      // RIGHT WALL KICK
      // 10 - 9 = 1 --> Xoffset = 0 -> 1 > 0 = TRUE  --> Xoffset = 1
      // 11 - 9 = 2 --> Xoffset = 1 -> 1 > 2 = FALSE --> Xoffset = 2
      if (new_x >= COL) {
        calc = new_x - (COL - 1);
        calc > Xoffset ? (Xoffset = calc) : Xoffset;
      }

      // LEFT WALL KICK
      // -1 < 0 --> true, then new_x(-1) < Xoffset = 0 --> true, then  Xoffset = -1
      // -2 < 0 --> true, then new_x(-2) < Xoffset = -1 --> true, then  Xoffset = -2
      if (new_x < 0) new_x < Xoffset ? (Xoffset = new_x) : Xoffset;

      // BOTTOM WALL KICK
      // 20 >= 20 --> true,
      // then calc (20 - (20 - 1)) = 1
      // 1 > 0 --> true, then Yoffset = 1
      if (new_y >= ROW) {
        calc = new_y - (ROW - 1);
        calc > Yoffset ? (Yoffset = calc) : Yoffset;
      }
      if (new_y < 0) {
        new_y < Yoffset ? (Yoffset = new_y) : Yoffset;
      }
    }
  }

  if (Yoffset) {
    console.log("Y OFFSET");
    // a kick or 2  in upwards dierection will occur bringing the piece up
    // a kick in downwards dierection will occur bringing the piece down
    for (let kick = 0; kick < Math.abs(Yoffset); kick++) {
      if (Yoffset + ROW >= ROW) piece.moveTo(moveTowards("up"));
      if (Yoffset < 0) piece.moveTo(moveTowards("down"));
    }
  }
  if (Xoffset) {
    console.log("X OFFSET");
    for (let kick = 0; kick < Math.abs(Xoffset); kick++) {
      // piece went beyond left wall
      if (Xoffset < 0) {
        // a kick or 2 in right dierection will occur
        moveRight(true);
      }
      // piece went beyond right wall
      if (Xoffset + COL >= COL) {
        // a kick or 2 in left dierection will occur
        moveLeft(true);
      }
    }
  }
  // console.table(gameBoard)
};

const getRandomPiece = () => {
  if (nextPiece === null) {
    // rand will hold a random number between 0 and the bag of tetrominoes length
    // and return a number. Math.floor() will convert the double to the nearest lower int
    // const rand = Math.floor( Math.random() * tetrominoes.length) ;
    const rand = Math.floor(Math.random() * tetrominoes.length);
    //getColor(rand + 1) >> + 1 is because in the array of colors the position 0 is saved for the empty space color (blackish)
    return new Piece(tetrominoes[rand], getColor(rand + 1), rand);
  }
  // return the same piece that the NEXT context has
  return new Piece(
    tetrominoes[nextPiece.number],
    getColor(nextPiece.number + 1),
    nextPiece.number
  );
};

const getNextPiece = () => {
  //get a completly new piece in the NEXT PIECE canvas
  //erase previous piece
  eraseGameBoard(NPctx, 4, 4);
  // set next piece to null, so we will generate a random piece
  nextPiece = null;
  nextPiece = getRandomPiece();
  //set piece in the correct position in the NextPiece canvas
  if (nextPiece.number === 5) {
    //is a square
    nextPiece.x = 0;
    nextPiece.y = -1;
  } else {
    nextPiece.x = 0;
    nextPiece.y = 0;
  }
  drawPiece(NPctx, nextPiece);
};

const startSendingData = () => {
    sendToServer = setInterval(() => clientServer.sendGameStatus(gameStatus), 2000);
  // clearInterval(sendToServer);
}
const stopSendingData = () => clearInterval(sendToServer);

const update = () => {
  if(!gamePaused){
    if (!gameOver) {
      let now = Date.now();
      let timeCounter = now - start;
  
      const sec = 1000 / speed;      
      
      if (timeCounter > sec) {
        moveDown();// clientServer.sendGameStatus(gameStatus);
        start = Date.now();
      }
      // eslint-disable-next-line no-unused-vars
      requestAnimationFrame(update);
    }
    else{
      stopSendingData();
    }
  } 

};

const keyControl = (e: any) => {
  // console.log(e)
  if (gameOver || gamePaused) return;
  
  else {
    if (e.type === "keydown") {
      // console.log(e.code)
      if (e.key === "KeyZ" || e.keyCode === 90) rotate(false);
      else if (e.key === "ArrowUp" || e.keyCode === 38) rotate(true);
      else if (e.key === "ArrowRight" || e.keyCode === 39) moveRight();
      else if (e.key === "ArrowLeft" || e.keyCode === 37) moveLeft();
      else if (e.key === "ArrowDown" || e.keyCode === 40) moveDown();
      else if (e.key === "Space" || e.keyCode === 32) hardDrop();
      else {
        console.log("invalid key");
      }
    }
    if (e.type === "keyup") {
      if (
        e.key === "ArrowRight" ||
        e.keyCode === 39 ||
        e.key === "ArrowLeft" ||
        e.keyCode === 37
      )
        start = Date.now();
    }
  }
};

playBtn.addEventListener("click", startGame);
pauseButton.addEventListener('click', pauseGame);
["keydown", "keyup"].forEach((e) => window.addEventListener(e, keyControl));


