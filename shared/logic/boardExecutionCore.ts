import type { BoardState, MoveCoordinates } from "../types/gameTypes";
import type { MoveExecutionResult } from "./boardTypes.ts";
import { getCapturedPosition } from "./boardGeometry.ts";
import { hasValidCapture } from "./boardCaptures.ts";
import { promoteToKing, shouldPromoteToKing } from "./pieceUtils.ts";

export function executeCaptureMove(
  boardState: BoardState,
  { fromRow, fromCol, toRow, toCol }: MoveCoordinates,
): MoveExecutionResult {
  const { capturedRow, capturedCol } = getCapturedPosition(
    fromRow,
    fromCol,
    toRow,
    toCol,
  );

  const newBoard = boardState.map((row) => [...row]);
  let piece = newBoard[fromRow][fromCol];

  newBoard[fromRow][fromCol] = 0;
  newBoard[capturedRow][capturedCol] = 0;

  if (shouldPromoteToKing(piece, toRow, toCol, newBoard.length)) {
    piece = promoteToKing(piece);
  }

  newBoard[toRow][toCol] = piece;

  return {
    newBoard,
    shouldChangePlayer: !hasValidCapture(newBoard, toRow, toCol),
  };
}

export function executeRegularMove(
  boardState: BoardState,
  { fromRow, fromCol, toRow, toCol }: MoveCoordinates,
): MoveExecutionResult {
  const newBoard = boardState.map((row) => [...row]);
  let piece = newBoard[fromRow][fromCol];

  newBoard[fromRow][fromCol] = 0;

  if (shouldPromoteToKing(piece, toRow, toCol, newBoard.length)) {
    piece = promoteToKing(piece);
  }

  newBoard[toRow][toCol] = piece;

  return {
    newBoard,
    shouldChangePlayer: true,
  };
}
