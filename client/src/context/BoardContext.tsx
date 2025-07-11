// Import React functions for context and reducer
import { createContext, useReducer } from "react";

// Type for the context value: contains board state and dispatch function
// state: current board state
// dispatch: function to update board state
type boardContextType = {
  state: checkersBoardState; // 2D array representing the board
  dispatch: React.Dispatch<{ type: string; payload?: object }>; // Dispatch function for actions
};

// Type for the board state: 2D array of numbers
// Each number can represent a piece, empty cell, etc.
type checkersBoardState = number[][];

// Initial board setup: 8x8 grid filled with 0s (empty cells)
const initialBoard: checkersBoardState = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

// Create the board context with default values
const boardContext = createContext<boardContextType>({
  state: initialBoard, // Default board state
  dispatch: () => {}, // Default dispatch (no-op)
});

// Reducer function to handle board actions
// Accepts current state and an action, returns new state
const boardReducer = (
  state: checkersBoardState,
  action: { type: string; payload?: object }
): checkersBoardState => {
  switch (action.type) {
    // Add cases for different actions here
    default:
      return state; // Return current state by default
  }
};

// Context provider component for the board
// Wraps children with board context
const BoardContext = ({ children }: { children: React.ReactNode }) => {
  // useReducer hook to manage board state
  const [state, dispatch] = useReducer(boardReducer, initialBoard);
  return (
    <boardContext.Provider value={{ state, dispatch }}>
      {children}
    </boardContext.Provider>
  );
};

// Export the provider for use in the app
export default BoardContext;
