import type { BoardState, PlayerIndex } from "../types/gameTypes.ts";
import { getPlayerFromPiece, NEUTRAL_PIECE } from "./pieceUtils.ts";

const MIDDLE_MIN = 3;
const MIDDLE_MAX = 10;

export function isInMiddleGrid(row: number, col: number): boolean {
  return (
    row >= MIDDLE_MIN &&
    row <= MIDDLE_MAX &&
    col >= MIDDLE_MIN &&
    col <= MIDDLE_MAX
  );
}

export function isInPlayerStartZone(
  row: number,
  col: number,
  player: PlayerIndex,
): boolean {
  switch (player) {
    case 1:
      return row >= 11 && row <= 13 && col >= MIDDLE_MIN && col <= MIDDLE_MAX;
    case 2:
      return col >= 0 && col <= 2 && row >= MIDDLE_MIN && row <= MIDDLE_MAX;
    case 3:
      return row >= 0 && row <= 2 && col >= MIDDLE_MIN && col <= MIDDLE_MAX;
    case 4:
      return col >= 11 && col <= 13 && row >= MIDDLE_MIN && row <= MIDDLE_MAX;
    default:
      return false;
  }
}

export function applyPlayerForfeit(
  boardState: BoardState,
  forfeitedPlayer: PlayerIndex,
): BoardState {
  const nextBoard = boardState.map((row) => [...row]);

  for (let row = 0; row < nextBoard.length; row++) {
    for (let col = 0; col < nextBoard[row].length; col++) {
      const piece = nextBoard[row][col];

      if (piece <= 0 || getPlayerFromPiece(piece) !== forfeitedPlayer) {
        continue;
      }

      if (isInPlayerStartZone(row, col, forfeitedPlayer)) {
        nextBoard[row][col] = 0;
        continue;
      }

      if (isInMiddleGrid(row, col)) {
        nextBoard[row][col] = NEUTRAL_PIECE;
        continue;
      }

      // If pieces have already migrated into other side lanes, neutralize them
      // too so the forfeited slot no longer owns any pieces.
      nextBoard[row][col] = NEUTRAL_PIECE;
    }
  }

  return nextBoard;
}
