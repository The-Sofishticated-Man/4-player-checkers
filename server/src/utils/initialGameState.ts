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

const cloneBoardState = (boardState: BoardState): BoardState =>
  boardState.map((row) => [...row]);

export const createInitialGameState = (): GameState => ({
  boardState: cloneBoardState(initialBoard),
  players: new Map(), // Start with an empty player map
  currentPlayer: initialPlayer,
  gameStarted: false, // Game starts as not started
  gameOver: false,
  winner: null,
  isDraw: false,
  activePlayers: [1, 2, 3, 4],
  turnsWithoutProgress: 0,
  stallDrawFullRounds: 20,
});

const initialGameState: GameState = createInitialGameState();

export default initialGameState;
