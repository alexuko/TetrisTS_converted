export default class Gameboard {
    //number of rows
    private row: number;
    //number of columns
    private col: number;

    constructor(rowSize:number, colSize:number) {
        this.row = rowSize;
        this.col = colSize;
    }
    //Create Game board returns an array 
    createGameBoard() {
        return [...Array(this.row)].map(() => Array(this.col).fill(0));
    }
}
