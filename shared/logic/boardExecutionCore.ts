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
  newBoard[toRow][toCol] = piece;

  const shouldContinueCapture = hasValidCapture(newBoard, toRow, toCol);
  const shouldChangePlayer = !shouldContinueCapture;

  // Crown only once the entire capture turn is complete.
  if (
    shouldChangePlayer &&
    shouldPromoteToKing(piece, toRow, toCol, newBoard)
  ) {
    newBoard[toRow][toCol] = promoteToKing(piece);
  }

  return {
    newBoard,
    shouldChangePlayer,
  };
}

export function executeRegularMove(
  boardState: BoardState,
  { fromRow, fromCol, toRow, toCol }: MoveCoordinates,
): MoveExecutionResult {
  const newBoard = boardState.map((row) => [...row]);
  let piece = newBoard[fromRow][fromCol];

  newBoard[fromRow][fromCol] = 0;

  if (shouldPromoteToKing(piece, toRow, toCol, newBoard)) {
    piece = promoteToKing(piece);
  }

  newBoard[toRow][toCol] = piece;

  return {
    newBoard,
    shouldChangePlayer: true,
  };
}
