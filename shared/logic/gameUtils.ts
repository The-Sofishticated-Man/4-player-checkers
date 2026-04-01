import type { BoardState } from "../types/gameTypes";
import isValidMove from "./movementValidation.ts";
import { isOccupied } from "./movementValidation.ts";
import { isValidCaptureForPlayer } from "./captureLogic.ts";

export function getValidMoves(
  board: BoardState,
  fromRow: number,
  fromCol: number,
): { row: number; col: number; isCapture: boolean }[] {
  const validMoves: { row: number; col: number; isCapture: boolean }[] = [];

  // Check all possible moves in a reasonable range
  for (let toRow = 0; toRow < board.length; toRow++) {
    for (let toCol = 0; toCol < board[0].length; toCol++) {
      const isRegularMove = isValidMove(board, fromRow, fromCol, toRow, toCol);
      const isCaptureMove =
        isValidCaptureForPlayer(board, fromRow, fromCol, toRow, toCol) &&
        !isOccupied(board, toRow, toCol);

      if (isRegularMove || isCaptureMove) {
        validMoves.push({ row: toRow, col: toCol, isCapture: isCaptureMove });
      }
    }
  }

  return validMoves;
}
