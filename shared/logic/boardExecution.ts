import { BoardState } from "../types/gameTypes";
import { shouldPromoteToKing, promoteToKing } from "./pieceUtils";
import { hasValidCapture } from "./captureLogic";

export interface MoveExecutionResult {
  newBoard: BoardState;
  shouldChangePlayer: boolean;
}

/**
 * Executes a capture move on the board
 */
export function executeCaptureMove(
  board: BoardState,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
): MoveExecutionResult {
  // Calculate captured piece position
  const capturedRow = (fromRow + toRow) / 2;
  const capturedCol = (fromCol + toCol) / 2;

  // Create a copy of the board
  const newBoard = board.map((row) => [...row]);
  let piece = newBoard[fromRow][fromCol];

  // Move piece
  newBoard[fromRow][fromCol] = 0;
  newBoard[capturedRow][capturedCol] = 0; // Remove captured piece

  // Check for king promotion
  if (shouldPromoteToKing(piece, toRow, toCol, newBoard.length)) {
    piece = promoteToKing(piece);
  }

  newBoard[toRow][toCol] = piece;

  // Check if the same piece has another valid capture
  const hasMoreCaptures = hasValidCapture(newBoard, toRow, toCol);

  // Only change player if no more captures available
  const shouldChangePlayer = !hasMoreCaptures;

  return {
    newBoard,
    shouldChangePlayer,
  };
}

/**
 * Executes a regular (non-capture) move on the board
 */
export function executeRegularMove(
  board: BoardState,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
): MoveExecutionResult {
  // Create a copy of the board
  const newBoard = board.map((row) => [...row]);
  let piece = newBoard[fromRow][fromCol];

  // Move piece
  newBoard[fromRow][fromCol] = 0;

  // Check for king promotion
  if (shouldPromoteToKing(piece, toRow, toCol, newBoard.length)) {
    piece = promoteToKing(piece);
  }

  newBoard[toRow][toCol] = piece;

  return {
    newBoard,
    shouldChangePlayer: true, // Regular moves always change player
  };
}

/**
 * Determines if a move is a capture move (2 squares diagonally)
 */
export function isCaptureMove(
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
): boolean {
  return Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 2;
}

/**
 * Advances to the next player in a 4-player game
 */
export function getNextPlayer(currentPlayer: 1 | 2 | 3 | 4): 1 | 2 | 3 | 4 {
  return ((currentPlayer % 4) + 1) as 1 | 2 | 3 | 4;
}
