import type { BoardAction } from "./boardActions";
import type { GameState } from "../../../shared/types/gameTypes";

import { Board } from "../../../shared/logic/boardModel";
import {
  evaluateGameStatus,
  getNextActivePlayer,
} from "../../../shared/logic/boardGameState";

const getNextTurn = (
  gameState: GameState,
  nextBoardState: GameState["boardState"],
) => {
  const status = evaluateGameStatus(nextBoardState);

  if (status.activePlayers.length === 0) {
    return gameState.currentPlayer;
  }

  return getNextActivePlayer(gameState.currentPlayer, status.activePlayers);
};

// Reducer function to handle board
// Accepts current state and an  returns new state
export const boardReducer = (
  gameState: GameState,
  { type, payload }: BoardAction,
): GameState => {
  const { boardState, currentPlayer } = gameState;
  const board = new Board(boardState);

  switch (type) {
    case "SANDBOX_APPLY_MOVE": {
      if (!payload) return gameState;

      const moveResult = board.applyMove(payload);

      return {
        ...gameState,
        boardState: moveResult.newBoard,
        currentPlayer: moveResult.shouldChangePlayer
          ? getNextTurn(gameState, moveResult.newBoard)
          : currentPlayer,
      };
    }

    case "MOVE_PIECE": {
      if (!payload) return gameState;
      const { fromRow, fromCol, toRow, toCol } = payload;

      // Validate the move before executing
      if (
        !board.isValidMoveWithCaptures(
          fromRow,
          fromCol,
          toRow,
          toCol,
          currentPlayer,
        )
      ) {
        return gameState; // Invalid move, return current state
      }

      // Check if it's the correct player's turn
      if (!board.isPlayersTurn(fromRow, fromCol, currentPlayer)) {
        return gameState; // Not this player's piece
      }

      const moveResult = board.applyMove({ fromRow, fromCol, toRow, toCol });

      return {
        ...gameState,
        boardState: moveResult.newBoard,
        currentPlayer: moveResult.shouldChangePlayer
          ? getNextTurn(gameState, moveResult.newBoard)
          : currentPlayer,
      };
    }

    case "CAPTURE_PIECE": {
      if (!payload) return gameState;
      const { fromRow, fromCol, toRow, toCol } = payload;

      // Validate this is actually a capture move
      if (!board.isCapture(fromRow, fromCol, toRow, toCol)) {
        return gameState; // Not a valid capture move
      }

      // Validate the capture is legal
      if (
        !board.isValidMoveWithCaptures(
          fromRow,
          fromCol,
          toRow,
          toCol,
          currentPlayer,
        )
      ) {
        return gameState; // Invalid capture
      }

      // Check if it's the correct player's turn
      if (!board.isPlayersTurn(fromRow, fromCol, currentPlayer)) {
        return gameState; // Not this player's piece
      }

      const moveResult = board.applyMove({ fromRow, fromCol, toRow, toCol });

      return {
        ...gameState,
        boardState: moveResult.newBoard,
        currentPlayer: moveResult.shouldChangePlayer
          ? getNextTurn(gameState, moveResult.newBoard)
          : currentPlayer,
      };
    }
    case "UPDATE_GAME_STATE": {
      console.log("Updating game state");
      if (!payload) return gameState;
      const { newGameState } = payload;
      console.log("new game state: ", newGameState);

      return newGameState;
    }

    case "UPDATE_CLOCK": {
      if (!payload) return gameState;

      return {
        ...gameState,
        clock: payload.clock,
      };
    }

    default:
      return gameState; // Return current state by default
  }
};
