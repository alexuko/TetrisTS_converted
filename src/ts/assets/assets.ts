// MOD of positive or negative numbers
// returns remainder of dividend by divisor
export const mod = (dividend: number, divisor:number) =>  (dividend % divisor + divisor) % divisor;

// Canvas measures
export const COL = 10;
export const ROW = 22;
export const SQ = 20;

const colors = [
    [0, 0, 10, 20],  // empty 
    [276, 94, 61, 100],  // T-tetromino 
    [31, 94, 48, 100],  // L-tetromino
    [230, 98, 50, 100],  // J-tetromino
    [100, 60, 48, 100],   // S-tetromino
    [356, 100, 40, 100], // Z-tetromino
    [58, 85, 52, 100],  // O-tetromino
    [192, 44, 85, 100]  // I-tetromino 
]

export const getColor = (pick:number) => {
    return colors[pick];
}

