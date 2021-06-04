// MOD of positive or negative numbers
// returns remainder of dividend by divisor
const mod = (dividend: number, divisor:number) =>  (dividend % divisor + divisor) % divisor;

enum Header {
    CONNECT = 'CONNECT',
    REQ_GAME = 'REQ_GAME',
    NEW_GAME = 'NEW_GAME',
    START_GAME = 'START_GAME',
    INVALID = 'INVALID',
    // HARD_DROP = 'HARD_DROP',
    // EXTRA_LINE = 'EXTRA_LINE',
    // POWER = 'POWER',
    // PUNISH = 'PUNISH',
    PLAY = 'PLAY',
    JOIN = 'JOIN',
    QUIT = 'QUIT'
  }
// Canvas measures
const COL = 10;
const ROW = 22;
const SQ = 20;

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

const getColor = (pick:number) => {
    return colors[pick];
}

export {
    getColor,
    COL,
    ROW,
    SQ,
    mod,
    Header
}