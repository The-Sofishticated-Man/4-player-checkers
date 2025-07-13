import type {
  checkersBoardState,
  currentPlayerState,
  gameState,
} from "../types/boardTypes";

// Initial board setup: 8x8 grid filled with 0s (empty cells)
const initialBoard: checkersBoardState = [
  [0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [2, 0, 2, 0, 2, 0, 2, 0],
  [0, 2, 0, 2, 0, 2, 0, 2],
  [2, 0, 2, 0, 2, 0, 2, 0],
];

const initialPlayer: currentPlayerState = 1; // Red starts first

const initialState: gameState = {
  checkersBoardState: initialBoard,
  currentPlayer: initialPlayer,
};

export default initialState;
