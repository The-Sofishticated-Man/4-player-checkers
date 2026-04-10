import { Socket } from "socket.io";
import { Game } from "../models/Game.ts";
import { Board } from "../../../shared/logic/boardModel.ts";
import { getNextActivePlayer } from "../../../shared/logic/boardGameState.ts";
import type { MoveCoordinates } from "../../../shared/types/gameTypes.ts";
import { SANDBOX_MODE } from "../utils/devSandbox.ts";
import { createGameStateEventPayload } from "../utils/sandboxEvents.ts";
import {
  advanceClock,
  grantIncrement,
  pauseClock,
  setRunningClockPlayer,
} from "../utils/gameClock.ts";
import {
  eliminatePlayerFromGame,
  evaluateAndApplyGameStatus,
} from "../utils/gameLifecycle.ts";

interface MoveParams extends MoveCoordinates {
  roomID: string;
}

const countMaterialPieces = (boardState: number[][]): number => {
  let pieceCount = 0;

  for (const row of boardState) {
    for (const cell of row) {
      if (cell > 0) {
        pieceCount++;
      }
    }
  }

  return pieceCount;
};

export class MoveHandlers {
  constructor(
    private socket: Socket,
    private games: Map<string, Game>,
  ) {}

  private advanceClockAndHandleTimeout(roomID: string, game: Game): boolean {
    const timedOutPlayer = advanceClock(game.gameState);
    if (timedOutPlayer === null) {
      return false;
    }

    eliminatePlayerFromGame(game, timedOutPlayer);

    const shouldEmitGameOver = game.gameState.gameOver ?? false;
    this.emitGameStateUpdate(roomID, game, shouldEmitGameOver);
    this.socket.emit(
      "move-error",
      "Time expired before your move was submitted",
    );

    return true;
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

    if (this.advanceClockAndHandleTimeout(roomID, game)) {
      return;
    }

    // Keep turn state resilient if the current player has been eliminated.
    evaluateAndApplyGameStatus(game);

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

    if (
      !SANDBOX_MODE &&
      !board.isValidMoveWithCaptures(
        fromRow,
        fromCol,
        toRow,
        toCol,
        game.gameState.currentPlayer,
      )
    ) {
      if (board.hasAnyCapture(game.gameState.currentPlayer) && !isCapture) {
        this.socket.emit("move-error", "Capture available: you must capture");
        return;
      }

      this.socket.emit(
        "move-error",
        isCapture ? "Invalid capture move" : "Invalid move",
      );
      return;
    }

    const movingPlayer = game.gameState.currentPlayer;
    const materialCountBefore = countMaterialPieces(game.gameState.boardState);
    const moveResult = board.applyMove(move);

    // Update game state
    game.gameState.boardState = moveResult.newBoard;

    const materialCountAfter = countMaterialPieces(moveResult.newBoard);
    const materialChanged = materialCountAfter !== materialCountBefore;

    if (materialChanged) {
      game.gameState.turnsWithoutProgress = 0;
    } else {
      game.gameState.turnsWithoutProgress =
        (game.gameState.turnsWithoutProgress ?? 0) + 1;
    }

    const activePlayers = evaluateAndApplyGameStatus(game);

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

    if (game.gameState.gameOver) {
      pauseClock(game.gameState);
    } else {
      if (moveResult.shouldChangePlayer) {
        grantIncrement(game.gameState, movingPlayer);
      }

      setRunningClockPlayer(game.gameState, game.gameState.currentPlayer);
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
