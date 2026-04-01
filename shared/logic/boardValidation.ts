import type { BoardState } from "../types/gameTypes";
import { getPlayerFromPiece, isKing } from "./pieceUtils.ts";
import { moveIsOutOfBounds, positionChanged } from "./boardGeometry.ts";

export function isOccupied(
  boardState: BoardState,
  row: number,
  col: number,
): boolean {
  return boardState[row][col] !== 0;
}

export function isPlayersTurn(
  boardState: BoardState,
  fromRow: number,
  fromCol: number,
  currentPlayer: number,
): boolean {
  const piece = boardState[fromRow][fromCol];
  const piecePlayer = getPlayerFromPiece(piece);
  return piecePlayer === currentPlayer;
}

export function isValidDiagonalMoveForPlayer(
  boardState: BoardState,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
): boolean {
  const piece = boardState[fromRow][fromCol];
  const player = getPlayerFromPiece(piece);

  if (isKing(piece)) {
    return Math.abs(fromRow - toRow) === 1 && Math.abs(fromCol - toCol) === 1;
  }

  switch (player) {
    case 1:
      return fromRow - toRow === 1 && Math.abs(fromCol - toCol) === 1;
    case 2:
      return Math.abs(fromRow - toRow) === 1 && toCol - fromCol === 1;
    case 3:
      return toRow - fromRow === 1 && Math.abs(fromCol - toCol) === 1;
    case 4:
      return Math.abs(fromRow - toRow) === 1 && fromCol - toCol === 1;
    default:
      return false;
  }
}

export function isValidMove(
  boardState: BoardState,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
): boolean {
  if (moveIsOutOfBounds(boardState, toRow, toCol)) {
    return false;
  }

  if (!positionChanged(fromRow, fromCol, toRow, toCol)) {
    return false;
  }

  if (isOccupied(boardState, toRow, toCol)) {
    return false;
  }

  return isValidDiagonalMoveForPlayer(
    boardState,
    fromRow,
    fromCol,
    toRow,
    toCol,
  );
}
