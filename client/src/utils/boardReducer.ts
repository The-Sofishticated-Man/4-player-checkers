import type { BoardAction, gameState } from "../types/boardTypes";
import isValidMove from "../logic/movementValidation";
import { hasValidCapture } from "../logic/captureLogic";
import { isPlayersTurn } from "../logic/movementValidation";
import { shouldPromoteToKing, promoteToKing } from "../logic/pieceUtils";

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
      let piece = newBoard[fromRow][fromCol];
      newBoard[fromRow][fromCol] = 0; // Clear the source cell

      // Check for king promotion
      if (shouldPromoteToKing(piece, toRow, toCol, newBoard.length)) {
        piece = promoteToKing(piece);
      }

      newBoard[toRow][toCol] = piece;

      return {
        ...state,
        checkersBoardState: newBoard,
        currentPlayer: ((currentPlayer % 4) + 1) as 1 | 2 | 3 | 4, // Cycle through players 1->2->3->4->1
      };
    }

    case "CAPTURE_PIECE": {
      if (!action.payload) return state;
      const { fromRow, fromCol, toRow, toCol, capturedRow, capturedCol } =
        action.payload;

      if (!isPlayersTurn(checkersBoardState, fromRow, fromCol, currentPlayer)) {
        return state;
      }
      // Validate the capture move using game logic
      if (!isValidMove(checkersBoardState, fromRow, fromCol, toRow, toCol)) {
        return state; // Invalid capture, don't change state
      }

      // Create a new board state (immutable update)
      const newBoard = checkersBoardState.map((row) => [...row]);

      // Move the piece from source to destination
      let piece = newBoard[fromRow][fromCol];
      newBoard[fromRow][fromCol] = 0; // Clear the source cell

      // Remove the captured piece
      newBoard[capturedRow][capturedCol] = 0;

      // Check for king promotion
      if (shouldPromoteToKing(piece, toRow, toCol, newBoard.length)) {
        piece = promoteToKing(piece);
      }

      newBoard[toRow][toCol] = piece;

      // Check if the same piece has another valid capture available
      const hasMoreCaptures = hasValidCapture(newBoard, toRow, toCol);

      return {
        ...state,
        checkersBoardState: newBoard,
        // Only switch players if no more captures are available
        currentPlayer: hasMoreCaptures
          ? currentPlayer
          : (((currentPlayer % 4) + 1) as 1 | 2 | 3 | 4),
      };
    }

    default:
      return state; // Return current state by default
  }
};
