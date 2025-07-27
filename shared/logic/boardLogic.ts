// Main board logic file - combines all game logic modules
import type { checkersBoardState } from "../types/boardTypes";
import isValidMove from "./movementValidation";
import { isValidCaptureForPlayer } from "./captureLogic";

// Enhanced isValidMove that includes capture validation
export default function isValidMoveWithCaptures(
  board: checkersBoardState,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
): boolean {
  // Check basic movement validation first
  if (isValidMove(board, fromRow, fromCol, toRow, toCol)) {
    return true;
  }

  // Check if it's a valid capture move (2 squares)
  if (isValidCaptureForPlayer(board, fromRow, fromCol, toRow, toCol)) {
    return true;
  }

  return false;
}

// Re-export all functions for backward compatibility
export { isPlayersTurn } from "./movementValidation";
export {
  isValidCaptureForPlayer,
  isCapture,
  getCapturedPosition,
  hasValidCapture,
} from "./captureLogic";
export {
  isKing,
  getPlayerFromPiece,
  shouldPromoteToKing,
  promoteToKing,
} from "./pieceUtils";
export { getValidMoves } from "./gameUtils";
