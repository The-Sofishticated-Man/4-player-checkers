import type {
  checkersBoardState,
  currentPlayerState,
  gameState,
} from "../../../shared/types/boardTypes";

// Initial board setup: 8x8 grid filled with 0s (empty cells)
const initialBoard: checkersBoardState = [
  [-1, -1, -1, 0, 3, 0, 3, 0, 3, 0, 3, -1, -1, -1],
  [-1, -1, -1, 3, 0, 3, 0, 3, 0, 3, 0, -1, -1, -1],
  [-1, -1, -1, 0, 3, 0, 3, 0, 3, 0, 3, -1, -1, -1],
  [0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 4],
  [2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0],
  [0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 4],
  [2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0],
  [0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 4],
  [2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0],
  [0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 4],
  [2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0],
  [-1, -1, -1, 1, 0, 1, 0, 1, 0, 1, 0, -1, -1, -1],
  [-1, -1, -1, 0, 1, 0, 1, 0, 1, 0, 1, -1, -1, -1],
  [-1, -1, -1, 1, 0, 1, 0, 1, 0, 1, 0, -1, -1, -1],
];

const initialPlayer: currentPlayerState = 1; // Red starts first

const initialState: gameState = {
  checkersBoardState: initialBoard,
  currentPlayer: initialPlayer,
};

export default initialState;
