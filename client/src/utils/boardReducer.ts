import type { BoardAction } from "./boardActions";
import type { GameState } from "../../../shared/types/gameTypes";

import { Board } from "../../../shared/logic/boardModel";
import {
  evaluateGameStatus,
  getNextActivePlayer,
} from "../../../shared/logic/boardGameState";
import {
  shouldPromoteToKing,
  promoteToKing,
} from "../../../shared/logic/pieceUtils";

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

      // Create a new board state (immutable update)
      const newBoard = boardState.map((row) => [...row]);

      // Move the piece from source to destination
      let movedPiece = newBoard[fromRow][fromCol];
      newBoard[fromRow][fromCol] = 0; // Clear the source cell

      // Check for king promotion
      if (shouldPromoteToKing(movedPiece, toRow, toCol, newBoard.length)) {
        movedPiece = promoteToKing(movedPiece);
      }

      newBoard[toRow][toCol] = movedPiece;

      return {
        ...gameState,
        boardState: newBoard,
        currentPlayer: getNextTurn(gameState, newBoard),
      };
    }

    case "CAPTURE_PIECE": {
      if (!payload) return gameState;
      const { fromRow, fromCol, toRow, toCol, capturedRow, capturedCol } =
        payload;

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

      // Create a new board state (immutable update)
      const newBoard = boardState.map((row) => [...row]);

      // Move the piece from source to destination
      let movedPiece = newBoard[fromRow][fromCol];
      newBoard[fromRow][fromCol] = 0; // Clear the source cell

      // Remove the captured piece
      newBoard[capturedRow][capturedCol] = 0;

      // Check for king promotion
      if (shouldPromoteToKing(movedPiece, toRow, toCol, newBoard.length)) {
        movedPiece = promoteToKing(movedPiece);
      }

      newBoard[toRow][toCol] = movedPiece;

      // Check if the same piece has another valid capture available
      const hasMoreCaptures = new Board(newBoard).hasValidCapture(toRow, toCol);

      return {
        ...gameState,
        boardState: newBoard,
        // Only switch players if no more captures are available
        currentPlayer: hasMoreCaptures
          ? currentPlayer
          : getNextTurn(gameState, newBoard),
      };
    }
    case "UPDATE_GAME_STATE": {
      console.log("Updating game state");
      if (!payload) return gameState;
      const { newGameState } = payload;
      console.log("new game state: ", newGameState);

      return newGameState;
    }
    default:
      return gameState; // Return current state by default
  }
};
