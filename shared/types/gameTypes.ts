export interface gameState {
  players: string[]; // Array of persistent player IDs
  boardState: number[][]; // 2D array representing the board state
  currentPlayer: number; // 1,2,3,4
  connectedPlayers: Map<string, string>; // Maps socket IDs to persistent player IDs
  gameStarted: boolean; // Whether the game has started (4 players joined)
}
