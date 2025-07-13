import type { BoardAction, gameState } from "../types/boardTypes";
import isValidMove, { isPlayersTurn } from "../logic/boardLogic";

// Reducer function to handle board actions
// Accepts current state and an action, returns new state
export const boardReducer = (
  state: gameState,
  action: BoardAction
): gameState => {
  const { checkersBoardState, currentPlayer } = state;

  switch (action.type) {
    case "MOVE_PIECE": {
      if (!action.payload) return state;
      const { fromRow, fromCol, toRow, toCol } = action.payload;
      // if it's not the player's turn, return current state
      if (!isPlayersTurn(checkersBoardState, fromRow, fromCol, currentPlayer)) {
        return state;
      }

      // Validate the move using game logic (should only be regular moves, not captures)
      if (!isValidMove(checkersBoardState, fromRow, fromCol, toRow, toCol)) {
        return state; // Invalid move, don't change state
      }

      // Create a new board state (immutable update)
      const newBoard = checkersBoardState.map((row) => [...row]);

      // Move the piece from source to destination
      const piece = newBoard[fromRow][fromCol];
      newBoard[toRow][toCol] = piece;
      newBoard[fromRow][fromCol] = 0; // Clear the source cell

      return {
        ...state,
        checkersBoardState: newBoard,
        currentPlayer: currentPlayer === 1 ? 2 : 1, // Switch players
      };
    }

    case "CAPTURE_PIECE": {
      if (!action.payload) return state;
      const { fromRow, fromCol, toRow, toCol, capturedRow, capturedCol } =
        action.payload;

      // Validate the capture move using game logic
      if (!isValidMove(checkersBoardState, fromRow, fromCol, toRow, toCol)) {
        return state; // Invalid capture, don't change state
      }

      // Create a new board state (immutable update)
      const newBoard = checkersBoardState.map((row) => [...row]);

      // Move the piece from source to destination
      const piece = newBoard[fromRow][fromCol];
      newBoard[toRow][toCol] = piece;
      newBoard[fromRow][fromCol] = 0; // Clear the source cell

      // Remove the captured piece
      newBoard[capturedRow][capturedCol] = 0;

      return {
        ...state,
        checkersBoardState: newBoard,
      };
    }

    default:
      return state; // Return current state by default
  }
};
