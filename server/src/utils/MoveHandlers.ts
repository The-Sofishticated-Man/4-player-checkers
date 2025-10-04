import { Socket } from "socket.io";
import { Game } from "../models/Game";

import isValidMove, {
  isPlayersTurn,
} from "../../../shared/logic/movementValidation";

import {
  isValidCaptureForPlayer,
  hasValidCapture,
} from "../../../shared/logic/captureLogic";

import {
  shouldPromoteToKing,
  promoteToKing,
} from "../../../shared/logic/pieceUtils";

import {
  executeCaptureMove,
  executeRegularMove,
  isCaptureMove,
  getNextPlayer,
} from "../../../shared/logic/boardExecution";

interface MoveParams {
  roomID: string;
  fromRow: number;
  toRow: number;
  fromCol: number;
  toCol: number;
}

export class MoveHandlers {
  constructor(private socket: Socket, private games: Map<string, Game>) {}

  handleMakeMove = ({ roomID, fromRow, toRow, fromCol, toCol }: MoveParams) => {
    // grab game
    const game = this.games.get(roomID);

    if (!game) {
      console.error(`Game not found for room: ${roomID}`);
      this.socket.emit("move-error", "Game not found");
      return;
    }

    const currentPlayerId = game.getPlayerFromSocket(this.socket.id);
    if (!currentPlayerId) {
      console.error(`Socket ID ${this.socket.id} not found in game state`);
      this.socket.emit("move-error", "Player not found");
      return;
    }

    console.log(
      `🚀 Move attempt - Room: ${roomID}, Player: ${currentPlayerId}, Move: (${fromRow},${fromCol}) → (${toRow},${toCol})`
    );
    console.log("current board state:");
    for (const row of game.boardState) {
      console.log(row.join(" "));
    }

    // Check if the game has started
    if (!game.gameStarted) {
      this.socket.emit(
        "move-error",
        "Game hasn't started yet - waiting for all 4 players to join"
      );
      return;
    }

    // Check if it's the current player's turn
    const playerIndex = game.getPlayerIndexFromId(currentPlayerId);
    if (game.currentPlayer !== playerIndex) {
      this.socket.emit("move-error", "It's not your turn");
      return;
    }

    // Validate that the piece belongs to the current player
    if (!isPlayersTurn(game.boardState, fromRow, fromCol, game.currentPlayer)) {
      this.socket.emit("move-error", "You can only move your own pieces");
      return;
    }

    // Check if this is a capture move (2 squares diagonally)
    const isCapture = isCaptureMove(fromRow, fromCol, toRow, toCol);

    let moveResult;

    if (isCapture) {
      // Validate capture move
      if (
        !isValidCaptureForPlayer(
          game.boardState,
          fromRow,
          fromCol,
          toRow,
          toCol
        )
      ) {
        this.socket.emit("move-error", "Invalid capture move");
        return;
      }

      // Execute the capture using shared logic
      moveResult = executeCaptureMove(
        game.boardState,
        fromRow,
        fromCol,
        toRow,
        toCol
      );
    } else {
      // Validate regular move
      if (!isValidMove(game.boardState, fromRow, fromCol, toRow, toCol)) {
        this.socket.emit("move-error", "Invalid move");
        return;
      }

      // Execute the regular move using shared logic
      moveResult = executeRegularMove(
        game.boardState,
        fromRow,
        fromCol,
        toRow,
        toCol
      );
    }

    // Update game state
    game.boardState = moveResult.newBoard;
    if (moveResult.shouldChangePlayer) {
      game.currentPlayer = getNextPlayer(game.currentPlayer);
    }

    // Emit new game state to all players in the room (exactly once)
    this.socket.to(roomID).emit("move-made", {
      boardState: moveResult.newBoard,
      currentPlayer: game.currentPlayer,
    });

    // Also emit to the player who made the move (exactly once)
    this.socket.emit("move-made", {
      boardState: moveResult.newBoard,
      currentPlayer: game.currentPlayer,
    });
    console.log(
      `✅ Move completed - Room: ${roomID}, Player: ${currentPlayerId}, New turn: Player ${game.currentPlayer}`
    );
    console.log("new board state:");
    for (const row of game.boardState) {
      console.log(row.join(" "));
    }
  };
}
