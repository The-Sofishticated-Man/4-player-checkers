import type {
  BoardState,
  PlayerIndex,
  GameState,
} from "../../../shared/types/gameTypes.ts";

// Initial board setup: 8x8 grid filled with 0s (empty cells)
const initialBoard: BoardState = [
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

const initialPlayer: PlayerIndex = 1; // Red starts first

const initialGameState: GameState = {
  boardState: initialBoard,
  players: new Map(), // Start with an empty player map
  currentPlayer: initialPlayer,
  gameStarted: false, // Game starts as not started
};

export default initialGameState;
