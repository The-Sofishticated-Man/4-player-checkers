// Type for the board state: 2D array of numbers
// Piece numbering system:
// 0 = empty cell
// -1 = inaccessible cell (e.g., for non-square boards)
// 1, 2, 3, 4 = regular pieces for players 1, 2, 3, 4
// 10, 20, 30, 40 = king pieces for players 1, 2, 3, 4
export type checkersBoardState = number[][];
export type currentPlayerState = 1 | 2 | 3 | 4; // Represents the current player (1-4)
export interface gameState {
  checkersBoardState: checkersBoardState; // 2D array representing the board
  currentPlayer: currentPlayerState; // Current player (1 or 2)
}
// Type for board actions
export type BoardAction =
  | {
      type: "MOVE_PIECE";
      payload: {
        fromRow: number;
        fromCol: number;
        toRow: number;
        toCol: number;
      };
    }
  | {
      type: "CAPTURE_PIECE";
      payload: {
        fromRow: number;
        fromCol: number;
        toRow: number;
        toCol: number;
        capturedRow: number;
        capturedCol: number;
      };
    }
  | { type: string; payload?: never };

// Type for the context value: contains board state and dispatch function
// state: current game state
// dispatch: function to update board state
export type boardContextType = {
  state: gameState;
  dispatch: React.Dispatch<BoardAction>; // Dispatch function for actions
};
