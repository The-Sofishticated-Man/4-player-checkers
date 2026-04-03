export type BoardState = number[][]; // 2D array representing the board state
export type PlayerIndex = 1 | 2 | 3 | 4; // Only 4 possible players

export type PlayerId = string;
export type GameId = string;

export interface MoveCoordinates {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
}

export type PlayerMap = Map<PlayerId, PlayerState>;
export interface PlayerState {
  isConnected: boolean;
  leftGame: boolean;
}

export interface GameState {
  boardState: BoardState; // 2D array representing the board
  players: PlayerMap;
  currentPlayer: PlayerIndex; // Current player (1 or 2)
  gameStarted?: boolean; // Whether the game has started (all 4 players joined)
  gameOver?: boolean;
  winner?: PlayerIndex | null;
  isDraw?: boolean;
  activePlayers?: PlayerIndex[];
}
