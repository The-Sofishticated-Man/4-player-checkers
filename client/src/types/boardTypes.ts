// Type for the board state: 2D array of numbers
// Each number can represent a piece, empty cell, etc.
export type checkersBoardState = number[][];

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
// state: current board state
// dispatch: function to update board state
export type boardContextType = {
  state: checkersBoardState; // 2D array representing the board
  dispatch: React.Dispatch<BoardAction>; // Dispatch function for actions
};
