//J, L, S, T, Z tetrominoes offset
const offset1 = [
  [1, 0], // X 1 pos right
  [1, 1], // X 1 pos right & Y 1 pos down
  [0, -2], // Y 2 pos up
  [1, -2], // X 1 pos right & Y 2 pos up
];
const offset2 = [
  [-1, 0], //  X to the left
  [-1, -1], // X 1 pos left & Y 1 pos up
  [0, 2], //   Y 2 pos down
  [-1, 2], //  X 1 pos left & Y 2 pos down
];
const offset3 = [
  [-1, 0], //  X to the left
  [-1, 1], //  X to the left & Y 1 pos down
  [0, -2], //  Y 2 pos up
  [-1, -2], // X 1 pos left & Y 2 pos up
];
const offset4 = [
  [1, 0], //  X 1 pos right
  [1, -1], //  X 1 pos right & Y 1 pos up
  [0, 2], //  Y 2 pos down
  [1, 2], //  X 1 pos right & Y 2 pos down
];
// * I Tetromino Offset Data
const offset5 = [
  [2, 0], //  X 2 pos to the right
  [-1, 0], // X 1 pos to the left
  [2, -1], // X 2 pos to the right & Y 1 pos up
  [-1, 2], //  X 1 pos to the left & 2 pos down
];
const offset6 = [
  [1, 0], //  X 1 pos to the right
  [-2, 0], // X 2 pos to the left
  [1, 2], //  X 1 pos to the right & Y 2 pos down
  [-2, -1], // X 2 pos to the left & 1 pos up
];
const offset7 = [
  [-2, 0], // X 2 pos left
  [1, 0], //  X 1 pos right
  [-2, 1], // X 2 pos left & Y 1 pos down
  [1, -2], //  X 1 pos right & Y 2 pos up
];
const offset8 = [
  [-1, 0], //  X 1 pos left
  [2, 0], //   X 2 pos right
  [-1, -2], // X 1 pos left & Y 2 pos up
  [2, 1], //    X 1 pos right & Y 1 pos down
];

export {
  offset1,
  offset2,
  offset3,
  offset4,
  offset5,
  offset6,
  offset7,
  offset8,
};
