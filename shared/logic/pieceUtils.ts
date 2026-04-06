import type { BoardState } from "../types/gameTypes";

export const NEUTRAL_PIECE = 5;

export function isKing(piece: number): boolean {
  return piece >= 10; // Kings are 10, 20, 30, 40 (player * 10)
}

export function getPlayerFromPiece(piece: number): number {
  if (piece === 0) return 0; // Empty
  if (piece === NEUTRAL_PIECE) return 0; // Neutral/capturable by anyone
  if (piece >= 10) return Math.floor(piece / 10); // Kings: 10->1, 20->2, 30->3, 40->4
  return piece; // Regular pieces: 1, 2, 3, 4
}

function isRegularPiece(piece: number): boolean {
  return piece > 0 && piece < 10 && piece !== NEUTRAL_PIECE;
}

function isOutOfPlayableBounds(
  boardState: BoardState,
  row: number,
  col: number,
): boolean {
  return (
    row < 0 ||
    row >= boardState.length ||
    col < 0 ||
    col >= boardState[0].length ||
    boardState[row][col] === -1
  );
}

function getForwardDiagonals(
  piece: number,
): Array<{ rowOffset: number; colOffset: number }> {
  const player = getPlayerFromPiece(piece);

  switch (player) {
    case 1:
      return [
        { rowOffset: -1, colOffset: -1 },
        { rowOffset: -1, colOffset: 1 },
      ];
    case 2:
      return [
        { rowOffset: -1, colOffset: 1 },
        { rowOffset: 1, colOffset: 1 },
      ];
    case 3:
      return [
        { rowOffset: 1, colOffset: -1 },
        { rowOffset: 1, colOffset: 1 },
      ];
    case 4:
      return [
        { rowOffset: -1, colOffset: -1 },
        { rowOffset: 1, colOffset: -1 },
      ];
    default:
      return [];
  }
}

export function isHardPromotionSquare(
  piece: number,
  toRow: number,
  toCol: number,
  boardSize: number,
): boolean {
  const player = getPlayerFromPiece(piece);

  if (player === 1 && toRow === 0) return true;
  if (player === 2 && toCol === boardSize - 1) return true;
  if (player === 3 && toRow === boardSize - 1) return true;
  if (player === 4 && toCol === 0) return true;

  return false;
}

export function isSoftPromotionSquare(
  piece: number,
  toRow: number,
  toCol: number,
  boardState: BoardState,
): boolean {
  if (!isRegularPiece(piece)) {
    return false;
  }

  if (isHardPromotionSquare(piece, toRow, toCol, boardState.length)) {
    return false;
  }

  const forwardDiagonals = getForwardDiagonals(piece);
  if (forwardDiagonals.length === 0) {
    return false;
  }

  return forwardDiagonals.every(({ rowOffset, colOffset }) =>
    isOutOfPlayableBounds(boardState, toRow + rowOffset, toCol + colOffset),
  );
}

export function shouldPromoteToKing(
  piece: number,
  toRow: number,
  toCol: number,
  boardState: BoardState,
): boolean {
  // Only regular pieces can be promoted (not already kings)
  if (!isRegularPiece(piece)) return false;

  return (
    isHardPromotionSquare(piece, toRow, toCol, boardState.length) ||
    isSoftPromotionSquare(piece, toRow, toCol, boardState)
  );
}

export function getSoftPromotionTargetsForPiece(
  piece: number,
  boardState: BoardState,
): Array<{ row: number; col: number }> {
  if (!isRegularPiece(piece)) {
    return [];
  }

  const targets: Array<{ row: number; col: number }> = [];

  for (let row = 0; row < boardState.length; row++) {
    for (let col = 0; col < boardState[row].length; col++) {
      if (boardState[row][col] === -1) {
        continue;
      }

      if (isSoftPromotionSquare(piece, row, col, boardState)) {
        targets.push({ row, col });
      }
    }
  }

  return targets;
}

export function promoteToKing(piece: number): number {
  if (piece >= 10 || piece <= 0 || piece === NEUTRAL_PIECE) return piece;
  return piece * 10; // Convert to king: 1->10, 2->20, 3->30, 4->40
}
