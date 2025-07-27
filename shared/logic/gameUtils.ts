import type { checkersBoardState } from "../types/boardTypes";
import isValidMove from "./movementValidation";

export function getValidMoves(
  board: checkersBoardState,
  fromRow: number,
  fromCol: number
): { row: number; col: number; isCapture: boolean }[] {
  const validMoves: { row: number; col: number; isCapture: boolean }[] = [];

  // Check all possible moves in a reasonable range
  for (let toRow = 0; toRow < board.length; toRow++) {
    for (let toCol = 0; toCol < board[0].length; toCol++) {
      if (isValidMove(board, fromRow, fromCol, toRow, toCol)) {
        const isCapture =
          Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 2;
        validMoves.push({ row: toRow, col: toCol, isCapture });
      }
    }
  }

  return validMoves;
}
