import { Socket } from "socket.io";
import { Game } from "../models/Game.ts";
import { generateID } from "../utils/gameUtils.ts";
import type { PlayerId, PlayerIndex } from "../../../shared/types/gameTypes.ts";
import { SANDBOX_MODE } from "../utils/devSandbox.ts";
import {
  MAX_NICKNAME_LENGTH,
  isNicknameWithinLimit,
} from "../../../shared/logic/nicknameValidation.ts";
import {
  createGameStateEventPayload,
  createSandboxRoomStatePayload,
  serializeGameState,
} from "../utils/sandboxEvents.ts";
import { eliminatePlayerFromGame } from "../utils/gameLifecycle.ts";
import {
  emitSystemChatMessage,
  getPlayerDisplayName,
} from "../utils/chatMessages.ts";

type RoomMode = "private" | "quickplay";

interface RoomCreationPayload {
  roomMode?: RoomMode;
  playerId?: PlayerId;
  nickname?: string;
}

let pendingQuickPlayRoomId: string | null = null;

interface ForfeitAck {
  ok: boolean;
  message?: string;
}

export class RoomHandlers {
  constructor(
    private socket: Socket,
    private games: Map<string, Game>,
  ) {}

  private resolveNickname(
    playerId: PlayerId,
    nickname?: string,
  ): string | null {
    const trimmedNickname = nickname?.trim();
    if (trimmedNickname) {
      return isNicknameWithinLimit(trimmedNickname) ? trimmedNickname : null;
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

  private createRoom(roomMode: RoomMode): Game {
    const roomID = generateID();
    const minPlayersToStart = roomMode === "quickplay" ? 4 : undefined;
    const game = new Game(roomID, roomMode === "private", minPlayersToStart);
    this.games.set(roomID, game);
    return game;
  }

  private clearPendingQuickPlayRoom(roomID: string): void {
    if (pendingQuickPlayRoomId === roomID) {
      pendingQuickPlayRoomId = null;
    }
  }

  private getPendingQuickPlayRoom(): Game | null {
    if (!pendingQuickPlayRoomId) {
      return null;
    }

    const pendingGame = this.games.get(pendingQuickPlayRoomId);
    if (!pendingGame) {
      pendingQuickPlayRoomId = null;
      return null;
    }

    if (
      pendingGame.gameStarted ||
      pendingGame.isFull() ||
      pendingGame.getConnectedPlayerCount() === 0
    ) {
      if (pendingGame.getConnectedPlayerCount() === 0) {
        this.games.delete(pendingQuickPlayRoomId);
      }

      pendingQuickPlayRoomId = null;
      return null;
    }

    return pendingGame;
  }

  private emitRoomJoined(game: Game, playerId: PlayerId, roomMode: RoomMode) {
    const playerIndex = game.getPlayerIndexFromId(playerId);
    const gameState = serializeGameState(game);
    const playerIds = Array.from(game.players.keys());
    const connectedPlayers = game.getConnectedPlayerIds();

    this.socket.emit("room-joined", {
      roomID: game.gameId,
      gameState,
      playerIndex,
      roomMode,
    });

    return { playerIndex, gameState, playerIds, connectedPlayers };
  }

  handleRoomCreation = (payload: RoomCreationPayload = {}) => {
    const roomMode: RoomMode = payload.roomMode ?? "private";

    if (roomMode === "quickplay") {
      const playerId = payload.playerId;
      if (!playerId) {
        this.socket.emit("room-join-denied", "Unable to start quick play");
        return;
      }

      const resolvedNickname = this.resolveNickname(playerId, payload.nickname);
      if (resolvedNickname === null) {
        this.socket.emit(
          "room-join-denied",
          `Nickname must be ${MAX_NICKNAME_LENGTH} characters or fewer`,
        );
        return;
      }

      let game = this.getPendingQuickPlayRoom();
      if (!game) {
        game = this.createRoom("quickplay");
        pendingQuickPlayRoomId = game.gameId;
      }

      if (game.hasPlayer(playerId)) {
        const existingPlayerState = game.players.get(playerId);
        if (existingPlayerState?.leftGame) {
          this.socket.emit(
            "room-join-denied",
            "You already forfeited this game",
          );
          return;
        }

        this.socket.join(game.gameId);
        game.reconnectPlayer(playerId, resolvedNickname);
      } else {
        game.addNewPlayer(playerId, resolvedNickname);
        this.socket.join(game.gameId);
      }

      this.socket.data.playerId = playerId;
      this.socket.data.gameId = game.gameId;

      const joinedPayload = this.emitRoomJoined(game, playerId, "quickplay");

      emitSystemChatMessage(
        this.socket,
        game.gameId,
        game,
        `${resolvedNickname} joined the game.`,
      );

      this.socket.to(game.gameId).emit("player-joined", {
        roomID: game.gameId,
        playerId,
        gameState: joinedPayload.gameState,
        playerIndex: joinedPayload.playerIndex,
        players: joinedPayload.playerIds,
        connectedPlayers: joinedPayload.connectedPlayers,
        gameStarted: game.gameStarted,
        roomMode: "quickplay",
      });

      const shouldStartGame = game.shouldStartGame();
      if (shouldStartGame) {
        const startGameData = {
          roomID: game.gameId,
          ...createGameStateEventPayload(game),
        };

        this.socket.to(game.gameId).emit("game-started", startGameData);
        this.socket.emit("game-started", startGameData);
        this.clearPendingQuickPlayRoom(game.gameId);
      }

      this.emitSandboxRoomState(game);

      this.socket.emit("room-created", {
        roomID: game.gameId,
        roomMode: "quickplay",
      });
      return;
    }

    const game = this.createRoom("private");

    this.socket.emit("room-created", {
      roomID: game.gameId,
      roomMode: "private",
    });
  };

  handleRoomJoin = (roomID: string, playerId: PlayerId, nickname?: string) => {
    const resolvedNickname = this.resolveNickname(playerId, nickname);
    if (resolvedNickname === null) {
      this.socket.emit(
        "room-join-denied",
        `Nickname must be ${MAX_NICKNAME_LENGTH} characters or fewer`,
      );
      return;
    }

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
        roomMode: game.isPrivate ? "private" : "quickplay",
      });

      emitSystemChatMessage(
        this.socket,
        roomID,
        game,
        `${getPlayerDisplayName(game, playerId)} reconnected to the game.`,
      );

      // Broadcast to all other players that someone reconnected
      this.socket.to(roomID).emit("player-reconnected", {
        roomID: game.gameId,
        playerId,
        playerIndex,
        gameState,
        players: playerIds,
        connectedPlayers,
        gameStarted: game.gameStarted,
        roomMode: game.isPrivate ? "private" : "quickplay",
      });

      this.emitSandboxRoomState(game);

      return;
    }

    // Check if room is full before adding new player
    if (game.isFull()) {
      this.socket.emit("room-full", roomID);
      return;
    }

    if (!game.isPrivate) {
      this.socket.emit(
        "room-join-denied",
        "This quick play game cannot be joined by room link",
      );
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
      roomMode: game.isPrivate ? "private" : "quickplay",
    });

    emitSystemChatMessage(
      this.socket,
      roomID,
      game,
      `${resolvedNickname} joined the game.`,
    );

    // Broadcast to all other players in the room that someone joined
    this.socket.to(roomID).emit("player-joined", {
      roomID: game.gameId,
      playerId,
      gameState,
      playerIndex,
      players: playerIds,
      connectedPlayers,
      gameStarted: game.gameStarted,
      roomMode: game.isPrivate ? "private" : "quickplay",
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

    const playerName = getPlayerDisplayName(game, playerId);

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
    eliminatePlayerFromGame(game, forfeitedPlayerIndex);

    emitSystemChatMessage(
      this.socket,
      game.gameId,
      game,
      `${playerName} left the game.`,
    );

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

    if (game.getConnectedPlayerCount() === 0) {
      this.clearPendingQuickPlayRoom(game.gameId);
      this.games.delete(game.gameId);
    }

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
      emitSystemChatMessage(
        this.socket,
        gameId,
        game,
        `${getPlayerDisplayName(game, disconnectedPlayerId)} disconnected.`,
      );

      this.socket.to(gameId).emit("player-disconnected", {
        playerId: disconnectedPlayerId,
        players: Array.from(game.players.keys()),
        connectedPlayers: game.getConnectedPlayerIds(),
        gameState: serializeGameState(game),
      });

      this.emitSandboxRoomState(game);

      if (game.getConnectedPlayerCount() === 0) {
        this.clearPendingQuickPlayRoom(gameId);
        this.games.delete(gameId);
      }
    }
  };
}
