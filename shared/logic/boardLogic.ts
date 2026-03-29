// Main board logic file - combines all game logic modules
import type { BoardState } from "../types/gameTypes";
import isValidMove from "./movementValidation.ts";
import { isValidCaptureForPlayer } from "./captureLogic.ts";

// Enhanced isValidMove that includes capture validation
export default function isValidMoveWithCaptures(
  board: BoardState,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
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
export { isPlayersTurn } from "./movementValidation.ts";
export {
  isValidCaptureForPlayer,
  isCapture,
  getCapturedPosition,
  hasValidCapture,
} from "./captureLogic.ts";
export {
  isKing,
  getPlayerFromPiece,
  shouldPromoteToKing,
  promoteToKing,
} from "./pieceUtils.ts";
export { getValidMoves } from "./gameUtils.ts";
export {
  executeCaptureMove,
  executeRegularMove,
  isCaptureMove,
  getNextPlayer,
  type MoveExecutionResult,
} from "./boardExecution.ts";
