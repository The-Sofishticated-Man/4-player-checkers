// Type for the board state: 2D array of numbers
// Each number can represent a piece, empty cell, etc.
export type checkersBoardState = number[][];

// Type for the context value: contains board state and dispatch function
// state: current board state
// dispatch: function to update board state
export type boardContextType = {
  state: checkersBoardState; // 2D array representing the board
  dispatch: React.Dispatch<{ type: string; payload?: object }>; // Dispatch function for actions
};
