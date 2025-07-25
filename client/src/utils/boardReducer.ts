import type { BoardAction, gameState } from "../../../shared/types/boardTypes";
import isValidMoveWithCaptures from "../../../shared/logic/boardLogic";
import { hasValidCapture, isCapture } from "../../../shared/logic/captureLogic";
import { isPlayersTurn } from "../../../shared/logic/movementValidation";
import {
  shouldPromoteToKing,
  promoteToKing,
} from "../../../shared/logic/pieceUtils";

// Reducer function to handle board
// Accepts current state and an  returns new state
export const boardReducer = (
  state: gameState,
  { type, payload }: BoardAction
): gameState => {
  const { checkersBoardState, currentPlayer } = state;

  switch (type) {
    case "MOVE_PIECE": {
      if (!payload) return state;
      const { fromRow, fromCol, toRow, toCol } = payload;

      // Validate the move before executing
      if (
        !isValidMoveWithCaptures(
          checkersBoardState,
          fromRow,
          fromCol,
          toRow,
          toCol
        )
      ) {
        return state; // Invalid move, return current state
      }

      // Check if it's the correct player's turn
      if (!isPlayersTurn(checkersBoardState, fromRow, fromCol, currentPlayer)) {
        return state; // Not this player's piece
      }

      // Create a new board state (immutable update)
      const newBoard = checkersBoardState.map((row) => [...row]);

      // Move the piece from source to destination
      let movedPiece = newBoard[fromRow][fromCol];
      newBoard[fromRow][fromCol] = 0; // Clear the source cell

      // Check for king promotion
      if (shouldPromoteToKing(movedPiece, toRow, toCol, newBoard.length)) {
        movedPiece = promoteToKing(movedPiece);
      }

      newBoard[toRow][toCol] = movedPiece;

      return {
        ...state,
        checkersBoardState: newBoard,
        currentPlayer: ((currentPlayer % 4) + 1) as 1 | 2 | 3 | 4, // Cycle through players 1->2->3->4->1
      };
    }

    case "CAPTURE_PIECE": {
      if (!payload) return state;
      const { fromRow, fromCol, toRow, toCol, capturedRow, capturedCol } =
        payload;

      // Validate this is actually a capture move
      if (!isCapture(fromRow, fromCol, toRow, toCol)) {
        return state; // Not a valid capture move
      }

      // Validate the capture is legal
      if (
        !isValidMoveWithCaptures(
          checkersBoardState,
          fromRow,
          fromCol,
          toRow,
          toCol
        )
      ) {
        return state; // Invalid capture
      }

      // Check if it's the correct player's turn
      if (!isPlayersTurn(checkersBoardState, fromRow, fromCol, currentPlayer)) {
        return state; // Not this player's piece
      }

      // Create a new board state (immutable update)
      const newBoard = checkersBoardState.map((row) => [...row]);

      // Move the piece from source to destination
      let movedPiece = newBoard[fromRow][fromCol];
      newBoard[fromRow][fromCol] = 0; // Clear the source cell

      // Remove the captured piece
      newBoard[capturedRow][capturedCol] = 0;

      // Check for king promotion
      if (shouldPromoteToKing(movedPiece, toRow, toCol, newBoard.length)) {
        movedPiece = promoteToKing(movedPiece);
      }

      newBoard[toRow][toCol] = movedPiece;

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
    case "UPDATE_GAME_STATE": {
      console.log("Updating game state");
      if (!payload) return state;
      const {
        newState: { checkersBoardState, currentPlayer },
      } = payload;
      console.log("newState: ", { checkersBoardState, currentPlayer });

      return {
        ...state,
        checkersBoardState,
        currentPlayer,
      };
    }
    default:
      return state; // Return current state by default
  }
};
