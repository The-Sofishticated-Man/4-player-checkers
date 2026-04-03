import { Socket } from "socket.io";
import { Game } from "../models/Game.ts";
import { generateID } from "../utils/gameUtils.ts";
import type { PlayerId } from "../../../shared/types/gameTypes.ts";
import { SANDBOX_MODE } from "../utils/devSandbox.ts";
import {
  createGameStateEventPayload,
  createSandboxRoomStatePayload,
  serializeGameState,
} from "../utils/sandboxEvents.ts";

export class RoomHandlers {
  constructor(
    private socket: Socket,
    private games: Map<string, Game>,
  ) {}

  private emitSandboxRoomState(game: Game): void {
    if (!SANDBOX_MODE) {
      return;
    }

    const payload = createSandboxRoomStatePayload(game);
    this.socket.to(game.gameId).emit("sandbox-room-state", payload);
    this.socket.emit("sandbox-room-state", payload);
  }

  handleRoomCreation = () => {
    const roomID = generateID();
    this.games.set(roomID, new Game(roomID));

    this.socket.emit("room-created", { roomID });
  };

  handleRoomJoin = (roomID: string, playerId: PlayerId) => {
    console.log(
      `User ${this.socket.id} (${playerId}) trying to join room: ${roomID}`,
    );

    const game = this.games.get(roomID);
    if (!game) {
      this.socket.emit("room-not-found", roomID);
      return;
    }

    // Check if player is already in the game (reconnecting)
    if (game.hasPlayer(playerId)) {
      this.socket.join(roomID);
      game.reconnectPlayer(playerId);
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
    game.addNewPlayer(playerId);
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
      });

      this.emitSandboxRoomState(game);
    }
  };
}
