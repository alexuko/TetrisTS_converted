export default class Piece {
  private _color: number[];
  private _number: number;
  private _x: number;
  private _y: number;
  private _position: number;
  private _tetrominoe: number[][][];
  private _activeTetrominoe: number[][];

    constructor(tetrominoe: number[][][], color: number[], number: number, xCoor?:number,yCoor?:number, pos?:number){
    this._tetrominoe  = tetrominoe; //tetrominoe with its positions
    this._color = color; //color from the colors array
    this._number = number;// tetromino number 0 - 6 there are 7 different pieces
    // All tetrominoes spawn horizontally and wholly above the playfield.
    // I & O spawn middle AND  J,L,S,Z & T  spawn rounded to the left.
    xCoor !== undefined ? this._x = xCoor : this._x = 3;  
    yCoor !== undefined ? this._y = yCoor : this._y = this._number < 5 ? 0 : -1;// If I | O then piece spawns at y = -1
    pos   !== undefined ? this._position = pos : this._position = 0;// each tetrominoe has 4 positions (0 - 3) except O (square) as it rotation is null
    this._activeTetrominoe = this.tetrominoe[this._position]; //tetrominow with current position
  }

  public get color(){
      return this._color;
  }

  public get tetrominoe() {
    return this._tetrominoe;
  }

  public set activeTetrominoe(newPosition:number[][]) {
    this._activeTetrominoe = newPosition;

  }
  public get activeTetrominoe() {
    return this._activeTetrominoe;
  }


  public get position() {
    return this._position;
  }

  public set position(newPosition: number) {
    if (newPosition < 0 || newPosition >= this._tetrominoe.length)
      throw Error("Invalid Position");
    this._position = newPosition;
  }

  public get x() {
    return this._x;
  }

  public set x(newX: number) {
    this._x = newX;
  }

  public get y(): number {
    return this._y;
  }

  public set y(newY: number) {
    this._y = newY;
  }

  public get number(): number {
    return this._number;
  }

  public set number(newNumber: number) {
    if (newNumber < 0 || newNumber > 7) throw new Error("invalid tetrominoe");
    this._number = newNumber;
  }

  public moveTo(dir:any) {
    if (!dir || dir[0] === "rotate") return;
    //directions a piece can move to
    if (dir[0] === "up") this._y -= 1;
    if (dir[0] === "left") this._x -= 1;
    if (dir[0] === "right") this._x += 1;
    if (dir[0] === "down") this._y += 1;
  }

  public lastOccupiedRowOrCol(isRow: boolean) {
    let row = 0,
      col = 0;
    for (let r = 0; r < this._activeTetrominoe.length; r++) {
      for (let c = 0; c < this._activeTetrominoe[r].length; c++) {
        //forget about zeros
        if (!this._activeTetrominoe[r][c]) continue;
        // compares current values with initial values (row and col variables)
        // if current values are bigger then replace variable value from either row or col
        row = r > row ? r : row;
        col = c > col ? c : col;
      }
    }
    // returns either column or row
    return isRow ? row : col;
  }
}
//method created to sort out the problem with rendering piece for contender
export const clonePiece = (piece:any) => {
  // debugger
  return new Piece(piece._tetrominoe, piece._color ,piece._number , piece._x, piece._y,piece._position);   
}