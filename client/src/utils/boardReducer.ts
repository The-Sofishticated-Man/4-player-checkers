import { PositionChanged } from "../logic/boardLogic";
import type { checkersBoardState, BoardAction } from "../types/boardTypes";

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

      // Check if the position hasn't changed
      if (!PositionChanged(fromRow, fromCol, toRow, toCol)) {
        return state;
      }

      // Check if the destination cell is already occupied
      if (state[toRow][toCol] !== 0) {
        return state; // Don't move if destination is occupied
      }

      // Create a new board state (immutable update)
      const newState = state.map((row) => [...row]);

      // Move the piece from source to destination
      const piece = newState[fromRow][fromCol];
      newState[toRow][toCol] = piece;
      newState[fromRow][fromCol] = 0; // Clear the source cell

      return newState;
    }
    default:
      return state; // Return current state by default
  }
};
