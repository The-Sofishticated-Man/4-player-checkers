import { Socket } from "socket.io";
import { Game } from "../models/Game.ts";
import { generateID } from "../utils/gameUtils.ts";
import type { PlayerId, PlayerIndex } from "../../../shared/types/gameTypes.ts";
import { SANDBOX_MODE } from "../utils/devSandbox.ts";
import {
  DEFAULT_STALL_DRAW_FULL_ROUNDS,
  evaluateGameStatus,
  getNextActivePlayer,
} from "../../../shared/logic/boardGameState.ts";
import { applyPlayerForfeit } from "../../../shared/logic/boardForfeit.ts";
import {
  createGameStateEventPayload,
  createSandboxRoomStatePayload,
  serializeGameState,
} from "../utils/sandboxEvents.ts";

interface ForfeitAck {
  ok: boolean;
  message?: string;
}

export class RoomHandlers {
  constructor(
    private socket: Socket,
    private games: Map<string, Game>,
  ) {}

  private resolveNickname(playerId: PlayerId, nickname?: string): string {
    const trimmedNickname = nickname?.trim();
    if (trimmedNickname) {
      return trimmedNickname;
    }

    return `P_${playerId}`;
  }

  private emitSandboxRoomState(game: Game): void {
    if (!SANDBOX_MODE) {
      return;
    }

    const payload = createSandboxRoomStatePayload(game);
    this.socket.to(game.gameId).emit("sandbox-room-state", payload);
    this.socket.emit("sandbox-room-state", payload);
  }

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

  handleRoomCreation = () => {
    const roomID = generateID();
    this.games.set(roomID, new Game(roomID));

    this.socket.emit("room-created", { roomID });
  };

  handleRoomJoin = (roomID: string, playerId: PlayerId, nickname?: string) => {
    const resolvedNickname = this.resolveNickname(playerId, nickname);

    console.log(
      `User ${this.socket.id} (${playerId}, ${resolvedNickname}) trying to join room: ${roomID}`,
    );

    const game = this.games.get(roomID);
    if (!game) {
      this.socket.emit("room-not-found", roomID);
      return;
    }

    // Check if player is already in the game (reconnecting)
    if (game.hasPlayer(playerId)) {
      const existingPlayerState = game.players.get(playerId);
      if (existingPlayerState?.leftGame) {
        this.socket.emit("room-join-denied", "You already forfeited this game");
        return;
      }

      this.socket.join(roomID);
      game.reconnectPlayer(playerId, resolvedNickname);
      this.socket.data.playerId = playerId;
      this.socket.data.gameId = roomID;
      const playerIndex = game.getPlayerIndexFromId(playerId);
      const gameState = serializeGameState(game);
      const playerIds = Array.from(game.players.keys());
      const connectedPlayers = game.getConnectedPlayerIds();

      // Emit to the reconnecting player
      this.socket.emit("room-joined", {
        roomID: game.gameId,
        gameState,
        playerIndex,
      });

      // Broadcast to all other players that someone reconnected
      this.socket.to(roomID).emit("player-reconnected", {
        roomID: game.gameId,
        playerId,
        playerIndex,
        gameState,
        players: playerIds,
        connectedPlayers,
        gameStarted: game.gameStarted,
      });

      this.emitSandboxRoomState(game);

      return;
    }

    // Check if room is full before adding new player
    if (game.isFull()) {
      this.socket.emit("room-full", roomID);
      return;
    }

    // New player joining
    const wasStartedBeforeJoin = game.gameStarted;
    game.addNewPlayer(playerId, resolvedNickname);
    this.socket.join(roomID);
    this.socket.data.playerId = playerId;
    this.socket.data.gameId = roomID;

    const playerIndex = game.getPlayerIndexFromId(playerId);
    const gameState = serializeGameState(game);
    const playerIds = Array.from(game.players.keys());
    const connectedPlayers = game.getConnectedPlayerIds();

    // Emit to the joining player
    this.socket.emit("room-joined", {
      roomID: game.gameId,
      gameState,
      playerIndex,
    });

    // Broadcast to all other players in the room that someone joined
    this.socket.to(roomID).emit("player-joined", {
      roomID: game.gameId,
      playerId,
      gameState,
      playerIndex,
      players: playerIds,
      connectedPlayers,
      gameStarted: game.gameStarted,
    });

    // Check if game transitioned to started state during this join.
    const shouldStartGame = !wasStartedBeforeJoin && game.shouldStartGame();

    // If game just started, broadcast game-started event to all players
    if (shouldStartGame) {
      const startGameData = {
        roomID: game.gameId,
        ...createGameStateEventPayload(game),
      };

      this.socket.to(roomID).emit("game-started", startGameData);
      this.socket.emit("game-started", startGameData);
    }

    this.emitSandboxRoomState(game);

    console.log(
      `User ${this.socket.id} added to room: ${roomID}. Players: ${
        game.playerCount
      }/4${shouldStartGame ? " - GAME STARTED!" : ""}`,
    );

    // Debug: Visualize game state after join
    game.logGameState();
  };

  handlePlayerForfeit = (
    roomID?: string,
    acknowledge?: (response: ForfeitAck) => void,
  ) => {
    const targetRoomId =
      roomID ?? (this.socket.data.gameId as string | undefined);
    const playerId = this.socket.data.playerId as string | undefined;

    if (!targetRoomId || !playerId) {
      acknowledge?.({ ok: false, message: "Not currently in a game room" });
      return;
    }

    const game = this.games.get(targetRoomId);
    if (!game) {
      acknowledge?.({ ok: false, message: "Game not found" });
      return;
    }

    const playerState = game.players.get(playerId);
    if (!playerState) {
      acknowledge?.({ ok: false, message: "Player not found in this game" });
      return;
    }

    if (playerState.leftGame) {
      acknowledge?.({ ok: false, message: "You already forfeited this game" });
      return;
    }

    const playerIndex = game.getPlayerIndexFromId(playerId);
    if (playerIndex < 1 || playerIndex > 4) {
      acknowledge?.({ ok: false, message: "Could not resolve player slot" });
      return;
    }

    const forfeitedPlayerIndex = playerIndex as PlayerIndex;

    game.gameState.boardState = applyPlayerForfeit(
      game.gameState.boardState,
      forfeitedPlayerIndex,
    );
    game.gameState.turnsWithoutProgress = 0;

    playerState.leftGame = true;
    playerState.isConnected = false;

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

    const roomPayload = {
      roomID: game.gameId,
      forfeitedPlayerId: playerId,
      forfeitedPlayerIndex,
      gameState: serializeGameState(game),
    };

    this.socket.to(game.gameId).emit("player-forfeited", roomPayload);
    this.socket
      .to(game.gameId)
      .emit("move-made", createGameStateEventPayload(game));

    if (game.gameState.gameOver) {
      this.socket
        .to(game.gameId)
        .emit("game-over", createGameStateEventPayload(game));
    }

    this.socket.emit("forfeit-complete", roomPayload);

    this.socket.leave(game.gameId);
    this.socket.data.gameId = undefined;
    this.socket.data.playerId = undefined;

    this.emitSandboxRoomState(game);

    acknowledge?.({ ok: true });
  };

  handlePlayerDisconnect = () => {
    console.log(`Player disconnected: ${this.socket.id}`);

    const gameId = this.socket.data.gameId as string | undefined;
    const playerId = this.socket.data.playerId as string | undefined;
    if (!gameId || !playerId) {
      return;
    }

    const game = this.games.get(gameId);
    if (!game) {
      return;
    }

    const disconnectedPlayerId = game.disconnectPlayer(playerId);
    if (disconnectedPlayerId) {
      this.socket.to(gameId).emit("player-disconnected", {
        playerId: disconnectedPlayerId,
        players: Array.from(game.players.keys()),
        connectedPlayers: game.getConnectedPlayerIds(),
        gameState: serializeGameState(game),
      });

      this.emitSandboxRoomState(game);
    }
  };
}
