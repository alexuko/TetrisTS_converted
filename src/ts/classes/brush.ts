//Brush is only going to draw squares
export default class Brush {
    private SQ: number;
    //size in pixels 
    constructor(sqrSize: number){
        this.SQ = sqrSize;
    }

    drawSquare (ctx:CanvasRenderingContext2D, x:number, y:number, color: number[]){
        // stroke width
        ctx.lineWidth = this.SQ / 20 
        const stroke = ctx.lineWidth;
        //coordenates to start drawing 
        const xPos_board = this.SQ * x;
        const yPos_board = this.SQ * y;
        // clear canvas on the selected coordenates first
        ctx.clearRect(xPos_board, yPos_board, this.SQ, this.SQ);
        //if the position of the array (color) return is zero then drawing will be like the empty square background else the color of the tetrominoe  
        ctx.fillStyle = color[0] !== 0  ? `hsl(${color[0]} ${color[1]}% ${color[2]}% / ${color[3]}%)` : `hsl(${color[0]} ${color[1]}% ${color[2]}% / ${color[3]}%)` ;
        //draw the rect at the position x and y and with the size (SQ)
        ctx.fillRect(xPos_board, yPos_board, this.SQ, this.SQ);
        //if the position of the array (color) return is zero then stroke will be like the empty square background else the color of the tetrominoe  
        ctx.strokeStyle = color[0] !== 0 ? `hsl(${color[0]} ${color[1]}% 30% / 90%)` : `hsl(${color[0]} ${color[1]}% 0% / 100%)`;
        //draw the rect stroke at the position x and y and with the size (SQ - stroke)
        ctx.strokeRect(xPos_board + (stroke / 2), yPos_board + (stroke / 2), this.SQ - stroke, this.SQ - stroke);
        
    }
    
    undrawSquare (ctx:CanvasRenderingContext2D, x:number, y:number) {
        //coordenates to start erasing  
        const xPos_board = this.SQ * x;
        const yPos_board = this.SQ * y;
        //erase a rect at the position x and y and with the size (SQ)        
        ctx.clearRect(xPos_board, yPos_board, this.SQ, this.SQ);
    }
}