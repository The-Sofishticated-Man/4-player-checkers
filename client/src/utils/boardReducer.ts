import type { checkersBoardState, BoardAction } from "../types/boardTypes";
import isValidMove from "../logic/boardLogic";

// Reducer function to handle board actions
// Accepts current state and an action, returns new state
export const boardReducer = (
  state: checkersBoardState,
  action: BoardAction
): checkersBoardState => {
  switch (action.type) {
    case "MOVE_PIECE": {
      if (!action.payload) return state;
      const { fromRow, fromCol, toRow, toCol } = action.payload;

      // Validate the move using game logic (should only be regular moves, not captures)
      if (!isValidMove(state, fromRow, fromCol, toRow, toCol)) {
        return state; // Invalid move, don't change state
      }

      // Create a new board state (immutable update)
      const newState = state.map((row) => [...row]);

      // Move the piece from source to destination
      const piece = newState[fromRow][fromCol];
      newState[toRow][toCol] = piece;
      newState[fromRow][fromCol] = 0; // Clear the source cell

      return newState;
    }

    case "CAPTURE_PIECE": {
      if (!action.payload) return state;
      const { fromRow, fromCol, toRow, toCol, capturedRow, capturedCol } =
        action.payload;

      // Validate the capture move using game logic
      if (!isValidMove(state, fromRow, fromCol, toRow, toCol)) {
        return state; // Invalid capture, don't change state
      }

      // Create a new board state (immutable update)
      const newState = state.map((row) => [...row]);

      // Move the piece from source to destination
      const piece = newState[fromRow][fromCol];
      newState[toRow][toCol] = piece;
      newState[fromRow][fromCol] = 0; // Clear the source cell

      // Remove the captured piece
      newState[capturedRow][capturedCol] = 0;

      return newState;
    }

    default:
      return state; // Return current state by default
  }
};
