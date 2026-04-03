import type { BoardState, PlayerIndex } from "../types/gameTypes.ts";
import { Board } from "./boardModel.ts";
import { getPlayerFromPiece } from "./pieceUtils.ts";

export interface BoardGameStatus {
  activePlayers: PlayerIndex[];
  gameOver: boolean;
  winner: PlayerIndex | null;
  isDraw: boolean;
}

const ALL_PLAYERS: PlayerIndex[] = [1, 2, 3, 4];

export function getActivePlayers(boardState: BoardState): PlayerIndex[] {
  const board = new Board(boardState);
  const activePlayers: PlayerIndex[] = [];

  for (const player of ALL_PLAYERS) {
    let hasAnyLegalMove = false;

    for (let row = 0; row < boardState.length && !hasAnyLegalMove; row++) {
      for (let col = 0; col < boardState[row].length; col++) {
        const piece = boardState[row][col];
        if (piece <= 0 || getPlayerFromPiece(piece) !== player) {
          continue;
        }

        if (board.getValidMoves(row, col).length > 0) {
          hasAnyLegalMove = true;
          break;
        }
      }
    }

    if (hasAnyLegalMove) {
      activePlayers.push(player);
    }
  }

  return activePlayers;
}

export function evaluateGameStatus(boardState: BoardState): BoardGameStatus {
  const activePlayers = getActivePlayers(boardState);

  if (activePlayers.length === 0) {
    return {
      activePlayers,
      gameOver: true,
      winner: null,
      isDraw: true,
    };
  }

  if (activePlayers.length === 1) {
    return {
      activePlayers,
      gameOver: true,
      winner: activePlayers[0],
      isDraw: false,
    };
  }

  return {
    activePlayers,
    gameOver: false,
    winner: null,
    isDraw: false,
  };
}

export function getNextActivePlayer(
  currentPlayer: PlayerIndex,
  activePlayers: PlayerIndex[],
): PlayerIndex {
  if (activePlayers.length === 0) {
    return currentPlayer;
  }

  let candidate = currentPlayer;

  for (let i = 0; i < 4; i++) {
    candidate = Board.getNextPlayer(candidate);
    if (activePlayers.includes(candidate)) {
      return candidate;
    }
  }

  return currentPlayer;
}
