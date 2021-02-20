import { tetrominoes, SQ, ROW, COL, getColor } from "./classes/tetrominoes";
import Gameboard from "./classes/gameBoard";
import Brush from "./classes/brush";
import Records from "./classes/records";
import Piece from "./classes/piece";

const nextPieceCanvas = document.querySelector("canvas#nextPiece")! as HTMLCanvasElement;
const NPctx = nextPieceCanvas.getContext("2d") as CanvasRenderingContext2D;

//Gameboard Canvas
const canvas = document.querySelector("canvas#tetris")! as HTMLCanvasElement;
const GBctx = canvas.getContext("2d") as CanvasRenderingContext2D;
canvas.width = COL * SQ;
canvas.height = ROW * SQ;

const empty = 0;
let score: number,
  lines: number,
  speed: number,
  gameBoard: number[][],
  brush: Brush,
  piece: Piece,
  lockedPiece: boolean,
  records: Records,
  nextPiece: Piece | null = null,
  gameOver = true,
  start = Date.now();

// Tuple use to represent  a pair of a string and a number (in that order ONLY) 
type Path = [string, number];
//String Literal Type so not other string than the ones within Pathway will be accepted
type Pathway = 'up' | 'down' | 'left' | 'right' | 'rotate';

const moveTowards = (dir: Pathway): Path => {
  let path: Path;
  if (dir === "up") path = ["up", -1];
  else if (dir === "right") path = ["right", 1];
  else if (dir === "left") path = ["left", -1];
  else if (dir === "down") path = ["down", 1];
  else path = ["rotate", 0];

  return path;
};

// MOD of positive or negative numbers
// returns remainder of dividend by divisor
const mod = (dividend: number, divisor:number) =>  (dividend % divisor + divisor) % divisor;

const drawGameBoard = (ctx:CanvasRenderingContext2D,rows:number, cols:number) => {
    //iterate through all rows 

    for(let r = 0; r < rows; r++){
        //now iterate through each column from each row
        for(let c = 0; c < cols; c++){
            // and then, draw a square         
            const color = getColor(gameBoard[r][c]);   
            // console.log(color)
            brush.drawSquare(ctx ,c,r,color);

            
        }
    }
};

const eraseGameBoard = (ctx:CanvasRenderingContext2D,rows:number, cols:number) => {
    //iterate through all rows 

    for(let r = 0; r < rows; r++){
        //now iterate through each column from each row
        for(let c = 0; c < cols; c++){
            // and then, draw a square         
            // const color = getColor(gameBoard[r][c]);   
            // console.log(color)
            brush.undrawSquare(ctx ,c,r);

            
        }
    }
};

const drawPiece = (ctx:any, currentPiece:Piece) => {
    
    try {
        currentPiece._activeTetrominoe.forEach((row:number[], rIndex:number) => {
            // console.log(this._activeTetrominoe[rIndex])
            row.forEach((col:number, cIndex:number) => {
                // console.log(this._activeTetrominoe[rIndex][cIndex])            
                if (currentPiece._activeTetrominoe[rIndex][cIndex]) { //if there is a "1" in the currentPiece matrix
                    // console.log(gameBoard[this.y+rIndex][this.x+cIndex])
                    if (gameBoard[currentPiece.y + rIndex][currentPiece.x + cIndex] !== empty) {
                        //move the position of the currentPiece 1 space up, it does not draw it on top of previous
                        gameOver = true;
                        alert('gameover')
                        return; // so this does not overdraw the previous currentPiece

                    }
                    brush.drawSquare(ctx, currentPiece.x + cIndex, currentPiece.y + rIndex, currentPiece.color); //draw a square
                }
            });
        });

    } catch (e) {
        console.error('error drawing the currentPiece: ' + e)

    }
}

const erasePiece = (ctx:CanvasRenderingContext2D,currentPiece:Piece) => {
    //iterate through current currentPiece
    try{
        currentPiece._activeTetrominoe.forEach((row:number[], rIndex:number) => {
            row.forEach((col:number, cIndex:number) => {
                //if there is a "number in the tetrominoe matrix e.g. 1" 
                if (currentPiece._activeTetrominoe[rIndex][cIndex]) {  
                    //first completly delete the square from the GB
                    brush.undrawSquare(ctx, currentPiece.x + cIndex, currentPiece.y + rIndex); //draw a square
                    //this will draw a black square (available space) in the current position 
                    brush.drawSquare(ctx, currentPiece.x + cIndex, currentPiece.y + rIndex, getColor(0)); //draw a square
                }
            });
        });

    }catch(e){
        console.error('error erasing the piece: ' + e)

    }
}



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
        if(fullRows > 0){
            lines += fullRows;
            fullRows < 4 ? score += fullRows * 10 : score += fullRows * 20;
            records.setLines(lines);
            records.setScore(score);
            speed = setSpeed(lines);
            records.setLevel(speed);
        }
}

const setSpeed = (linesCompleted:number = 0) => {
    return linesCompleted <= 0 ? 1 : Math.floor(1 + (((linesCompleted - 1) / 10) + .1));    
}

const pullRowsDown = (from:number) => {
        // console.log(`pullRowsDown() ${from}`)
         // iterate every row in the GB from bottom up
        for(let r = from; r >= 0; r--){
            for(let c = 0; c < COL; c++){
                //if row has a preceding row then switch current row by the preceding one
                //then if the row is the first row (0) then there is no rows before, 
                // so we set to zeros the entire row
                r > 0 ? gameBoard[r][c] = gameBoard[r-1][c] : gameBoard[r][c] = 0 ;  
            }
            
        }
        console.table(gameBoard)
    }

const merge = () => {
        try{
            //check tetrominoe matrix (rows and cols)
            //first loop through all of the rows
            for (let r = 0; r < piece._activeTetrominoe.length; r++) { 
                //for each row loop through all of the columns
                for (let c = 0; c < piece._activeTetrominoe[r].length; c++) { 
                    //if a empty space is found then omit
                    if (!piece._activeTetrominoe[r][c]) continue;
                    //merge tetrominoe matrix with GB matrix
                    gameBoard[piece.y + r][piece.x + c] = piece._activeTetrominoe[r][c];
                }
            }

        }catch(e) {
            //this error will pop out if a problem with merging the piece
            //most likely when piece merges out of bounds ( negative rows) 
            console.error('Error merging the piece: ' + e)
        }

}

const moveUp = (rotateAction: boolean = false) => {
  //check if there is no collision, if there's no,then move tetrominoe to the right 1 space
  if (!rotateAction) {
      
    // if (!collision(DIRECTION.up)) {
    if (!collision(moveTowards('up'))) {
      //check if there is no collision and if there is not,
      erasePiece(GBctx, piece);
      piece.moveTo(moveTowards('up'));
      drawPiece(GBctx, piece);
    }
  } else {
    piece.moveTo(moveTowards('up'));
    return;
  }
};

const moveDown = () => {
    // debugger;
    if (!collision(moveTowards('down'))) {
        erasePiece(GBctx,piece)
        piece.moveTo(moveTowards('down'))
        drawPiece(GBctx,piece)
    } else {
        merge()
        checkFullRows();
        drawGameBoard(GBctx, ROW, COL)
        lockedPiece =true;
        piece = getRandomPiece();
        drawPiece(GBctx, piece);
        getNextPiece();
    }
}

const hardDrop = () => {
    // console.log(`hard drop`)
    //get tetrominoe last occupied positions in its matrix (row and col) 
    const tetroLastCol = piece.lastOccupiedRowOrCol(false)
    const tetroLastRow = piece.lastOccupiedRowOrCol(true)
    // set to false so se can unlock the piece and drop it
    lockedPiece = false;
    // r = starting from where piece spawns y + the last tetrominoe occupied row + 1 as arrays are zero based
    // iterate until last row of the gameboard 
    for(let r = piece.y + tetroLastRow + 1; r <= ROW - 1; r++){
        // c = starting from where piece spawns x + + the last tetrominoe occupied col  
        for(let c = piece.x; c <=  piece.x + tetroLastCol; c++){
            // console.log(`row: ${r} col: ${c}`)
            // if the piece has not been locked then keep moving down 
            if(!lockedPiece) moveDown();
            // if piece is lock, leave loop 
            else break;
        }
    }    
}

const moveRight = (rotateAction = false) => {
        //check if there is no collision, if there's no,then move tetrominoe to the right 1 space
    if (!rotateAction) {
        if (!collision(moveTowards('right'))) { //check if there is no collision and if there is not,
            erasePiece(GBctx,piece)
            piece.moveTo(moveTowards('right'));
            drawPiece(GBctx,piece)
        }

    } else {
        piece.moveTo(moveTowards('right'))
        return;
    }
}



const moveLeft = (rotateAction = false) => {
        //check if there is no collision, if there's no,then move tetrominoe to the left 1 space
        if (!rotateAction) {
            if (!collision(moveTowards('left'))) {
                erasePiece(GBctx, piece)
                // if (!this.hitWall(DIRECTION.left)) {
                piece.moveTo(moveTowards('left'));
                drawPiece(GBctx, piece)
            }
        } else {
            piece.moveTo(moveTowards('left'))
            return;
        }
    }

    
const rotate = (clockwise:boolean, rotTimes: number = 0) => {
    try {
        console.log(`Rotation-times: ${rotTimes}`)
        
        const initialPosition = piece.position;
        const initial_X = piece.x;
        const initial_Y = piece.y;
        
        // Check if the piece will rotate clockwise or counterclockwise
        let rotation = clockwise ? 1 : -1;
        // If this is the first time that the piece rotates then erase the piece
        if (rotTimes === 0) erasePiece(GBctx, piece);
        // Increment the number of rotation times by 1
        rotTimes++;
        // position 0 - 1 = -1 + 4 = 3 % 4 = 3
        // position 0 + 1 = 1 % 4 = 1
        // position 1 + 1 = 2 % 4 = 2
        // Move to prev or next tetrominoe position
        console.log(piece.tetrominoe.length);
        piece.position = mod(piece.position + rotation, piece.tetrominoe.length);
        console.log('piece.position ' + piece.position);
        // get the position from the original tetrominoe and pass it to the active tetrominoe
        piece._activeTetrominoe = piece.tetrominoe[piece.position];
        // Check if the piece overlapped with the wall, if it did then call wallkick()
        // Arrage the piece to a correct place within the gameboard
        if (collision(moveTowards('rotate'))) wallKick();
        // Check that piece did not overlapped with another piece after rotation
        if (!piecesOverlapped()) {
            // If it did not then redraw the piece and finish method
            drawPiece(GBctx, piece)
            console.log(piece._activeTetrominoe);
            return;
        }
        
        // if piece overlapped then fix overlap
        fixOverlap();
        // if piece still overlapping then rotate piece until a suitable nerby space for it 
        if (piecesOverlapped()) {
            rotTimes === 4 && piece.x + (piece._activeTetrominoe.length - 1) < COL ? piece.moveTo(moveTowards('right')) : piece.moveTo(moveTowards('left'));
            rotTimes === 8 && piece.y + (piece._activeTetrominoe.length - 1) < ROW ? piece.moveTo(moveTowards('down')) : piece.moveTo(moveTowards('up'));
            rotTimes === 12 && piece.x > COL ? piece.moveTo(moveTowards('left')) : piece.moveTo(moveTowards('right'));
            rotTimes === 16 && piece.y >= 0 ? piece.moveTo(moveTowards('up')) : piece.moveTo(moveTowards('down'));
            if (rotTimes === 20) { // do not do anything and leave piece on its original position
                console.log('initial position')
                piece.x = initial_X;
                piece.y = initial_Y;
                piece.position = initialPosition;
                drawPiece(GBctx, piece)
                return;
            }
            rotate(clockwise, rotTimes);
        }

        // Once piece does not overlap then redraw piece on the Gameboard
        drawPiece(GBctx, piece)
    } catch (e) {
        console.error(`There was an error roating the piece ${e}`)
    }


}

const fixOverlap = () => {
    let new_x, new_y;
    //loop through all of the rows
    for (let r = 0; r < piece._activeTetrominoe.length; r++) { 
        //for each row loop through all of the columns
        for (let c = 0; c < piece._activeTetrominoe[r].length; c++) { 
            // skip zeros in the tetrominoe matrix
            if (!piece._activeTetrominoe[r][c]) continue; 
            new_x = piece.x + c;
            new_y = piece.y + r;
            // in 5 tetrominoes, length will be of "2"                
            let last = piece._activeTetrominoe.length - 1; 

            // console.log('*******Now********')
            // console.log(`r:${r} C:${c}`)
            // console.log(`piece.y:${piece.y} piece.x:${piece.x}`)
            // console.log(`yC:${new_y} xC:${new_x}`)
            // console.log(`last ${last}`)
            // console.log(`board ${gameBoard[new_y][new_x]}  so ${gameBoard[new_y][new_x]}`)
            /**
             * TRIPLE CHECK THIS LOGIC
             */
            if (c === 0 && piece._activeTetrominoe[r][0] !== empty && gameBoard[new_y][new_x] !== empty) {
                console.error(`hit left`)
                piece.moveTo(moveTowards('right'));
            } else if (c === last && piece._activeTetrominoe[r][last] !== empty && gameBoard[new_y][new_x] !== empty) {
                console.error(`hit right`)
                piece.moveTo(moveTowards('left'))
            } else if (r === last && piece._activeTetrominoe[last][c] !== empty && gameBoard[new_y][new_x] !== empty) {
                console.error(`hit bottom`)
                piece.moveTo(moveTowards('up'))
            } else if (r === 0 && piece._activeTetrominoe[0][c] !== empty && gameBoard[new_y][new_x] !== empty) {
                console.error(`hit top`)
                piece.moveTo(moveTowards('down'))
            }

        }
    }
}

const piecesOverlapped = () => {
    try {
        let new_x, new_y;
        for (let r = 0; r < piece._activeTetrominoe.length; r++) { //loop through all of the rows
            for (let c = 0; c < piece._activeTetrominoe[r].length; c++) { //for each row loop through all of the columns
                if (!piece._activeTetrominoe[r][c]) continue; // skip zeros in the tetrominoe matrix
                new_x = piece.x + c; // New x (column) position from each square of the tetrominoe
                new_y = piece.y + r; // New y (row)    position from each square of the tetrominoe
                // if any of the squares lands on a non empty position in the board then, it overlapped
                // or piece 
                if (gameBoard[new_y][new_x] !== empty || // If its = 1
                    new_y < 0 || new_y >= ROW) { // if piece goes beyound ceiling or floor 
                    console.log('pieces overlapped')
                    return true
                }
            }
        }
        // console.log('does not overlap')
        // Piece did not overlapped 
        return false;

    } catch (e) {
        console.error(`There was an error while checking if pieces overlapped: ${e}`)

    }
}


// const collision = (dir) => {

const collision = (dir:Path) => {
        // console.log('**********************')      
        for (let r = 0; r < piece._activeTetrominoe.length; r++) { //loop through all of the rows
            for (let c = 0; c < piece._activeTetrominoe.length; c++) { //for each row loop through all of the columns
                if (!piece._activeTetrominoe[r][c]) continue; // skip zeros in the tetrominoe matrix
                // get new X coordinates for each block of the tetrominoe
                let xCoord = piece.x + c;
                let yCoord = piece.y + r;
                try {
                    
                    if (dir[0] === 'rotate') {//check for collision on rotation
                        // For testing
                        // console.log('Now')
                        // console.log(`yC:${yCoord} xC:${xCoord}`)
                        // console.log('board '+ (gameBoard[yCoord][xCoord] !== empty))
                        // Check if any SQUARE that builds up the tetrominoe is out of bounds 
                        // or overlaps an already occupied space                        
                        if (yCoord < 0 || yCoord >= ROW ||   
                            xCoord < 0 || xCoord >= COL){
                                console.warn(`Collided`)
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
                        if (xCoord < 0 || xCoord >= COL || gameBoard[yCoord][xCoord] !== empty) return true;
                        if (xCoord > 0 || xCoord < COL) continue;
                    }

                } catch (error) {
                    if(yCoord > -3 ) continue;
                    console.log("Out of Bounds");
                    return true;
                }


            }
        }
        return false; // if no collision then if ok to move tetrominoe
    }

 
const wallKick = () => {
        let r, c, new_x, new_y, calc, Xoffset = 0,Yoffset = 0;

        for (r = 0; r < piece._activeTetrominoe.length; r++) { //loop through all of the rows            
            for (c = 0; c < piece._activeTetrominoe[r].length; c++) { //for each row loop through all of its columns
                if (!piece._activeTetrominoe[r][c]) continue; // skip zeros in the tetrominoe matrix
                new_x = piece.x + c;
                new_y = piece.y + r;
                
                // RIGHT WALL KICK
                // 10 - 9 = 1 --> Xoffset = 0 -> 1 > 0 = TRUE  --> Xoffset = 1
                // 11 - 9 = 2 --> Xoffset = 1 -> 1 > 2 = FALSE --> Xoffset = 2
                if (new_x >= COL) {
                    calc = new_x - (COL - 1);
                    calc > Xoffset ? Xoffset = calc : Xoffset;                    
                }

                // LEFT WALL KICK
                // -1 < 0 --> true, then new_x(-1) < Xoffset = 0 --> true, then  Xoffset = -1
                // -2 < 0 --> true, then new_x(-2) < Xoffset = -1 --> true, then  Xoffset = -2                
                if (new_x < 0 ) new_x < Xoffset ? Xoffset = new_x : Xoffset;
                
                // BOTTOM WALL KICK
                // 20 >= 20 --> true, 
                // then calc (20 - (20 - 1)) = 1   
                // 1 > 0 --> true, then Yoffset = 1   
                if (new_y >= ROW) {
                    calc = new_y - (ROW - 1);
                    calc > Yoffset ? Yoffset = calc : Yoffset;
                }
                if(new_y < 0){
                    new_y < Yoffset ? Yoffset = new_y : Yoffset; 
                }
            }
        }

        if (Yoffset) {
            console.log("Y OFFSET");
            // a kick or 2  in upwards dierection will occur bringing the piece up 
            // a kick in downwards dierection will occur bringing the piece down 
            for (let kick = 0; kick < Math.abs(Yoffset); kick++) {
                if ((Yoffset + ROW) >= ROW) piece.moveTo(moveTowards('up'));
                if (Yoffset < 0) piece.moveTo(moveTowards('down'));
            }
        }
        if (Xoffset) {
            console.log("X OFFSET");
            for (let kick = 0; kick < Math.abs(Xoffset); kick++) {
                // piece went beyond left wall
                if (Xoffset < 0) {
                    // a kick or 2 in right dierection will occur 
                    moveRight(true)
                }
                // piece went beyond right wall
                if ((Xoffset + COL) >= COL) {
                    // a kick or 2 in left dierection will occur 
                    moveLeft(true)
                }
            }
        }
        // console.table(gameBoard)
    }




const getRandomPiece = () => {
    if(nextPiece === null) {
        // rand will hold a random number between 0 and the bag of tetrominoes length 
        // and return a number. Math.floor() will convert the double to the nearest lower int 
        // const rand = Math.floor( Math.random() * tetrominoes.length) ;
        const rand = Math.floor( Math.random() * tetrominoes.length) ;
        //getColor(rand + 1) >> + 1 is because in the array of colors the position 0 is saved for the empty space color (blackish)  
        return new Piece(tetrominoes[rand],getColor(rand + 1),rand)
        
        
    }
    // return the same piece that the NEXT context has
    return new Piece(tetrominoes[nextPiece.number],getColor(nextPiece.number + 1),nextPiece.number)
}

const getNextPiece = () => {
    //get a completly new piece in the NEXT PIECE canvas
    //erase previous piece
    eraseGameBoard(NPctx,4, 4);
    // set next piece to null, so we will generate a random piece
    nextPiece = null;
    nextPiece = getRandomPiece();
    //set piece in the correct position in the NextPiece canvas   
    if( nextPiece.number === 5 ){
        //is a square
        nextPiece.x = 0;
        nextPiece.y = -1;
    }else{
        nextPiece.x = 0;
        nextPiece.y = 0;
    }
    drawPiece(NPctx,nextPiece);
}



const update = () => {
    
    if(!gameOver){
        let now = Date.now();
        let timeCounter = now - start;

        const sec = 1000 / speed;
    
        if (timeCounter > sec) {
            moveDown();
            start = Date.now();
        }
    
        // eslint-disable-next-line no-unused-vars
        requestAnimationFrame(update);
    }
};




const keyControl = (e:any) => {
    // console.log(e)
    if(!gameOver){
        if (e.type === "keydown") {
            // console.log(e.code)
            if (e.key === "KeyZ"      || e.keyCode === 90) rotate(false);
            else if (e.key === "ArrowUp"   || e.keyCode === 38) rotate(true);
            else if (e.key === "ArrowRight"|| e.keyCode === 39) moveRight();                
            else if (e.key === "ArrowLeft" || e.keyCode === 37) moveLeft();
            else if (e.key === "ArrowDown" || e.keyCode === 40) moveDown();
            else if (e.key === "Space"     || e.keyCode === 32) hardDrop();
            else{console.log("invalid key")}
        }
        if (e.type === "keyup") {
            if ((e.key === "ArrowRight"|| e.keyCode === 39) ||  
                (e.key === "ArrowLeft" || e.keyCode === 37)  ) start = Date.now();
            }

    }
};

const init = () => {
    let GB = new Gameboard(ROW,COL);
    gameBoard = GB.createGameBoard();
    brush = new Brush(SQ);
    gameOver = false;
    records = new Records();
    records.setInitialUIvalues()
    drawGameBoard(GBctx,ROW, COL)
    piece = getRandomPiece()
    drawPiece(GBctx,piece);
    getNextPiece()
    score = records.score;
    lines = records.lines;
    // speed = setSpeed();  
    // update();

}

["keydown", "keyup"].forEach((e) => window.addEventListener(e,keyControl));

//Start Game
init();