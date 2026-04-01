import type { PlayerIndex } from "../types/gameTypes";
import type { BoardState } from "../types/gameTypes";
import type { CapturedPosition } from "./boardTypes.ts";

export function positionChanged(
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
): boolean {
  return fromRow !== toRow || fromCol !== toCol;
}

export function moveIsOutOfBounds(
  boardState: BoardState,
  toRow: number,
  toCol: number,
): boolean {
  return (
    toRow < 0 ||
    toRow >= boardState.length ||
    toCol < 0 ||
    toCol >= boardState[0].length ||
    boardState[toRow][toCol] === -1
  );
}

export function isCapture(
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
): boolean {
  return Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 2;
}

export function getCapturedPosition(
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
): CapturedPosition {
  return {
    capturedRow: (fromRow + toRow) / 2,
    capturedCol: (fromCol + toCol) / 2,
  };
}

export function getNextPlayer(currentPlayer: PlayerIndex): PlayerIndex {
  return ((currentPlayer % 4) + 1) as PlayerIndex;
}
