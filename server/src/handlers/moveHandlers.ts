import { Socket } from "socket.io";
import { Game } from "../models/Game.ts";
import { Board } from "../../../shared/logic/boardModel.ts";
import {
  evaluateGameStatus,
  getNextActivePlayer,
} from "../../../shared/logic/boardGameState.ts";
import type {
  MoveCoordinates,
  PlayerIndex,
} from "../../../shared/types/gameTypes.ts";
import { SANDBOX_MODE } from "../utils/devSandbox.ts";
import { createGameStateEventPayload } from "../utils/sandboxEvents.ts";

interface MoveParams extends MoveCoordinates {
  roomID: string;
}

export class MoveHandlers {
  constructor(
    private socket: Socket,
    private games: Map<string, Game>,
  ) {}

  private evaluateAndApplyGameStatus(game: Game): PlayerIndex[] {
    const status = evaluateGameStatus(game.gameState.boardState);
    game.gameState.activePlayers = status.activePlayers;
    game.gameState.gameOver = status.gameOver;
    game.gameState.winner = status.winner;
    game.gameState.isDraw = status.isDraw;

    if (status.gameOver && status.winner) {
      game.gameState.currentPlayer = status.winner;
    }

    return status.activePlayers;
  }

  private emitGameStateUpdate(
    roomID: string,
    game: Game,
    emitGameOverEvent = false,
  ): void {
    const payload = createGameStateEventPayload(game);

    this.socket.to(roomID).emit("move-made", payload);
    this.socket.emit("move-made", payload);

    if (emitGameOverEvent && payload.gameOver) {
      this.socket.to(roomID).emit("game-over", payload);
      this.socket.emit("game-over", payload);
    }
  }

  handleMakeMove = ({ roomID, fromRow, toRow, fromCol, toCol }: MoveParams) => {
    const move: MoveCoordinates = {
      fromRow,
      fromCol,
      toRow,
      toCol,
    };

    // grab game
    const game = this.games.get(roomID);

    if (!game) {
      console.error(`Game not found for room: ${roomID}`);
      this.socket.emit("move-error", "Game not found");
      return;
    }

    if (game.gameState.gameOver) {
      this.socket.emit("move-error", "Game is over");
      return;
    }

    const currentPlayerId = this.socket.data.playerId as string | undefined;
    if (!currentPlayerId) {
      console.error(`Socket ID ${this.socket.id} not found in game state`);
      this.socket.emit("move-error", "Player not found");
      return;
    }

    console.log(
      `🚀 Move attempt - Room: ${roomID}, Player: ${currentPlayerId}, Move: (${fromRow},${fromCol}) → (${toRow},${toCol})`,
    );
    console.log("current board state:");
    for (const row of game.gameState.boardState) {
      console.log(row.join(" "));
    }

    // Check if the game has started
    if (!SANDBOX_MODE && !game.gameStarted) {
      this.socket.emit(
        "move-error",
        "Game hasn't started yet - waiting for all 4 players to join",
      );
      return;
    }

    // Check if it's the current player's turn
    const playerIndex = game.getPlayerIndexFromId(currentPlayerId);
    if (!SANDBOX_MODE && game.gameState.currentPlayer !== playerIndex) {
      this.socket.emit("move-error", "It's not your turn");
      return;
    }

    // Validate that the piece belongs to the current player
    const board = new Board(game.gameState.boardState);

    if (
      !SANDBOX_MODE &&
      !board.isPlayersTurn(fromRow, fromCol, game.gameState.currentPlayer)
    ) {
      this.socket.emit("move-error", "You can only move your own pieces");
      return;
    }

    // Check if this is a capture move (2 squares diagonally)
    const isCapture = Board.isCapture(
      move.fromRow,
      move.fromCol,
      move.toRow,
      move.toCol,
    );

    if (isCapture) {
      // Validate capture move
      if (
        !SANDBOX_MODE &&
        !board.isValidCaptureForPlayer(fromRow, fromCol, toRow, toCol)
      ) {
        this.socket.emit("move-error", "Invalid capture move");
        return;
      }
    } else {
      // Validate regular move
      if (!SANDBOX_MODE && !board.isValidMove(fromRow, fromCol, toRow, toCol)) {
        this.socket.emit("move-error", "Invalid move");
        return;
      }
    }

    const moveResult = board.applyMove(move);

    // Update game state
    game.gameState.boardState = moveResult.newBoard;

    const activePlayers = this.evaluateAndApplyGameStatus(game);

    if (moveResult.shouldChangePlayer && !game.gameState.gameOver) {
      game.gameState.currentPlayer = getNextActivePlayer(
        game.gameState.currentPlayer,
        activePlayers,
      );
    } else if (
      !game.gameState.gameOver &&
      activePlayers.length > 0 &&
      !activePlayers.includes(game.gameState.currentPlayer)
    ) {
      game.gameState.currentPlayer = activePlayers[0];
    }

    // Emit new game state to all players in the room (exactly once)
    const shouldEmitGameOver = game.gameState.gameOver ?? false;
    this.emitGameStateUpdate(roomID, game, shouldEmitGameOver);
    console.log(
      `✅ Move completed - Room: ${roomID}, Player: ${currentPlayerId}, New turn: Player ${game.gameState.currentPlayer}${
        game.gameState.gameOver
          ? game.gameState.isDraw
            ? " - DRAW"
            : ` - WINNER: Player ${game.gameState.winner}`
          : ""
      }`,
    );
    console.log("new board state:");
    for (const row of game.gameState.boardState) {
      console.log(row.join(" "));
    }
  };
}
