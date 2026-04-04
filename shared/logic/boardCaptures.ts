import type { BoardState } from "../types/gameTypes";
import type { ValidMove } from "./boardTypes.ts";
import { getPlayerFromPiece, isKing } from "./pieceUtils.ts";
import { isCapture, moveIsOutOfBounds } from "./boardGeometry.ts";
import { isOccupied, isValidMove } from "./boardValidation.ts";

export function isValidCaptureForPlayer(
  boardState: BoardState,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
): boolean {
  const piece = boardState[fromRow][fromCol];
  const player = getPlayerFromPiece(piece);

  if (!isCapture(fromRow, fromCol, toRow, toCol)) {
    return false;
  }

  if (moveIsOutOfBounds(boardState, toRow, toCol)) {
    return false;
  }

  const middleRow = (fromRow + toRow) / 2;
  const middleCol = (fromCol + toCol) / 2;

  if (
    middleRow < 0 ||
    middleRow >= boardState.length ||
    middleCol < 0 ||
    middleCol >= boardState[0].length ||
    boardState[middleRow][middleCol] === -1
  ) {
    return false;
  }

  const middlePiece = boardState[middleRow][middleCol];
  const middlePlayer = getPlayerFromPiece(middlePiece);

  if (middlePiece === 0 || middlePlayer === player) {
    return false;
  }

  if (isKing(piece)) {
    return true;
  }

  switch (player) {
    case 1:
      return fromRow - toRow === 2;
    case 2:
      return toCol - fromCol === 2;
    case 3:
      return toRow - fromRow === 2;
    case 4:
      return fromCol - toCol === 2;
    default:
      return false;
  }
}

export function hasValidCapture(
  boardState: BoardState,
  fromRow: number,
  fromCol: number,
): boolean {
  const directions = [
    [-2, -2],
    [-2, 2],
    [2, -2],
    [2, 2],
  ];

  for (const [rowOffset, colOffset] of directions) {
    const toRow = fromRow + rowOffset;
    const toCol = fromCol + colOffset;

    if (
      toRow >= 0 &&
      toRow < boardState.length &&
      toCol >= 0 &&
      toCol < boardState[0].length
    ) {
      if (
        isValidCaptureForPlayer(boardState, fromRow, fromCol, toRow, toCol) &&
        !isOccupied(boardState, toRow, toCol)
      ) {
        return true;
      }
    }
  }

  return false;
}

export function hasAnyCaptureForPlayer(
  boardState: BoardState,
  player: number,
): boolean {
  if (player < 1 || player > 4) {
    return false;
  }

  for (let row = 0; row < boardState.length; row++) {
    for (let col = 0; col < boardState[0].length; col++) {
      if (getPlayerFromPiece(boardState[row][col]) !== player) {
        continue;
      }

      if (hasValidCapture(boardState, row, col)) {
        return true;
      }
    }
  }

  return false;
}

export function getValidMoves(
  boardState: BoardState,
  fromRow: number,
  fromCol: number,
  currentPlayer?: number,
): ValidMove[] {
  if (
    fromRow < 0 ||
    fromRow >= boardState.length ||
    fromCol < 0 ||
    fromCol >= boardState[0].length
  ) {
    return [];
  }

  const piece = boardState[fromRow][fromCol];
  if (piece <= 0) {
    return [];
  }

  const piecePlayer = getPlayerFromPiece(piece);
  const movingPlayer = currentPlayer ?? piecePlayer;

  if (piecePlayer !== movingPlayer) {
    return [];
  }

  const playerHasCapture = hasAnyCaptureForPlayer(boardState, movingPlayer);
  const validMoves: ValidMove[] = [];

  for (let toRow = 0; toRow < boardState.length; toRow++) {
    for (let toCol = 0; toCol < boardState[0].length; toCol++) {
      const isCaptureMove =
        isValidCaptureForPlayer(boardState, fromRow, fromCol, toRow, toCol) &&
        !isOccupied(boardState, toRow, toCol);
      const isRegularMove =
        !playerHasCapture &&
        isValidMove(boardState, fromRow, fromCol, toRow, toCol);

      if (isRegularMove || isCaptureMove) {
        validMoves.push({ row: toRow, col: toCol, isCapture: isCaptureMove });
      }
    }
  }

  return validMoves;
}

export function isValidMoveWithCaptures(
  boardState: BoardState,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  currentPlayer?: number,
): boolean {
  if (
    fromRow < 0 ||
    fromRow >= boardState.length ||
    fromCol < 0 ||
    fromCol >= boardState[0].length
  ) {
    return false;
  }

  const piece = boardState[fromRow][fromCol];
  if (piece <= 0) {
    return false;
  }

  const piecePlayer = getPlayerFromPiece(piece);
  const movingPlayer = currentPlayer ?? piecePlayer;

  if (piecePlayer !== movingPlayer) {
    return false;
  }

  const isCaptureMove =
    isValidCaptureForPlayer(boardState, fromRow, fromCol, toRow, toCol) &&
    !isOccupied(boardState, toRow, toCol);

  if (hasAnyCaptureForPlayer(boardState, movingPlayer)) {
    return isCaptureMove;
  }

  return (
    isCaptureMove || isValidMove(boardState, fromRow, fromCol, toRow, toCol)
  );
}
