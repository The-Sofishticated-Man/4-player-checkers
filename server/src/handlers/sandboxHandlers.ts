import { Socket } from "socket.io";
import { Game } from "../models/Game.ts";
import {
  DEFAULT_STALL_DRAW_FULL_ROUNDS,
  evaluateGameStatus,
  getNextActivePlayer,
} from "../../../shared/logic/boardGameState.ts";
import type { PlayerIndex } from "../../../shared/types/gameTypes.ts";
import { SANDBOX_MODE } from "../utils/devSandbox.ts";
import {
  createGameStateEventPayload,
  createSandboxRoomStatePayload,
  type SandboxGetRoomStateParams,
  type SandboxSetStateParams,
} from "../utils/sandboxEvents.ts";

interface SandboxStateAppliedPayload {
  roomID: string;
}

export class SandboxHandlers {
  constructor(
    private socket: Socket,
    private games: Map<string, Game>,
  ) {}

  private evaluateAndApplyGameStatus(game: Game): PlayerIndex[] {
    const status = evaluateGameStatus(game.gameState.boardState, {
      turnsWithoutProgress: game.gameState.turnsWithoutProgress,
      stallDrawFullRounds:
        game.gameState.stallDrawFullRounds ?? DEFAULT_STALL_DRAW_FULL_ROUNDS,
    });
    game.gameState.activePlayers = status.activePlayers;
    game.gameState.gameOver = status.gameOver;
    game.gameState.winner = status.winner;
    game.gameState.isDraw = status.isDraw;

    if (status.gameOver && status.winner) {
      game.gameState.currentPlayer = status.winner;
    } else if (
      status.activePlayers.length > 0 &&
      !status.activePlayers.includes(game.gameState.currentPlayer)
    ) {
      game.gameState.currentPlayer = getNextActivePlayer(
        game.gameState.currentPlayer,
        status.activePlayers,
      );
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

  private emitSandboxRoomState(roomID: string, game: Game): void {
    const payload = createSandboxRoomStatePayload(game);
    this.socket.to(roomID).emit("sandbox-room-state", payload);
    this.socket.emit("sandbox-room-state", payload);
  }

  private emitSandboxError(message: string): void {
    this.socket.emit("sandbox-error", message);
  }

  handleSandboxGetRoomState = (payload: SandboxGetRoomStateParams) => {
    const roomID = payload?.roomID;
    if (!roomID) {
      this.emitSandboxError("Missing roomID");
      return;
    }

    if (!SANDBOX_MODE) {
      this.emitSandboxError("Sandbox mode is disabled on the server");
      return;
    }

    const game = this.games.get(roomID);
    if (!game) {
      this.emitSandboxError("Game not found");
      return;
    }

    this.socket.emit("sandbox-room-state", createSandboxRoomStatePayload(game));
  };

  handleSandboxSetState = (payload: SandboxSetStateParams) => {
    const {
      roomID,
      boardState,
      currentPlayer,
      gameStarted,
      turnsWithoutProgress,
      stallDrawFullRounds,
    } = payload ?? {};

    if (!roomID) {
      this.emitSandboxError("Missing roomID");
      return;
    }

    if (!SANDBOX_MODE) {
      this.emitSandboxError("Sandbox mode is disabled on the server");
      return;
    }

    const game = this.games.get(roomID);
    if (!game) {
      this.emitSandboxError("Game not found");
      return;
    }

    const wasGameOver = game.gameState.gameOver === true;

    if (boardState) {
      game.gameState.boardState = boardState.map((row) => [...row]);
      game.gameState.turnsWithoutProgress = 0;
    }

    if (currentPlayer !== undefined) {
      game.gameState.currentPlayer = currentPlayer;
    }

    if (typeof gameStarted === "boolean") {
      game.gameStarted = gameStarted;
    }
    game.gameState.gameStarted = game.gameStarted;

    if (turnsWithoutProgress !== undefined) {
      game.gameState.turnsWithoutProgress = Math.max(0, turnsWithoutProgress);
    }

    if (stallDrawFullRounds !== undefined) {
      game.gameState.stallDrawFullRounds =
        stallDrawFullRounds > 0
          ? stallDrawFullRounds
          : DEFAULT_STALL_DRAW_FULL_ROUNDS;
    }

    const activePlayers = this.evaluateAndApplyGameStatus(game);
    if (
      !game.gameState.gameOver &&
      activePlayers.length > 0 &&
      !activePlayers.includes(game.gameState.currentPlayer)
    ) {
      game.gameState.currentPlayer = getNextActivePlayer(
        game.gameState.currentPlayer,
        activePlayers,
      );
    }

    const shouldEmitGameOver =
      !wasGameOver && (game.gameState.gameOver ?? false);
    this.emitGameStateUpdate(roomID, game, shouldEmitGameOver);
    this.emitSandboxRoomState(roomID, game);

    const ackPayload: SandboxStateAppliedPayload = { roomID };
    this.socket.emit("sandbox-state-applied", ackPayload);
  };
}
