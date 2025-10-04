import { Socket } from "socket.io";
import { Game } from "../models/Game";
import { generateRoomId } from "../utils/gameUtils";
import { BoardState } from "../../../shared/types/gameTypes";

export class RoomHandlers {
  constructor(private socket: Socket, private games: Map<string, Game>) {}

  handleRoomCreation = (initialBoard: BoardState) => {
    const gameId = generateRoomId();
    this.games.set(gameId, new Game(gameId, initialBoard, this.socket));
  };

  handleRoomJoin = (roomID: string, playerId: string) => {
    console.log(
      `User ${this.socket.id} (${playerId}) trying to join room: ${roomID}`
    );

    const game = this.games.get(roomID);
    if (!game) {
      this.socket.emit("room-not-found", roomID);
      return;
    }

    // Check if player is already in the game (reconnecting)
    if (game.hasPlayer(playerId)) {
      game.reconnectPlayer(playerId, this.socket);
      const playerIndex = game.getPlayerIndexFromId(playerId);
      const gameState = game.getGameStateInfo();

      // Emit to the reconnecting player
      this.socket.emit("room-joined", {
        ...gameState,
        playerId,
        playerIndex,
      });

      // Broadcast to all other players that someone reconnected
      this.socket.to(roomID).emit("player-reconnected", {
        ...gameState,
        playerId,
        playerIndex,
      });

      return;
    }

    // Check if room is full before adding new player
    if (game.isFull()) {
      this.socket.emit("room-full");
      return;
    }

    // New player joining
    game.addPlayer(playerId, this.socket.id);
    this.socket.join(roomID);

    const playerIndex = game.getPlayerIndexFromId(playerId);
    const gameState = game.getGameStateInfo();

    // Emit to the joining player
    this.socket.emit("room-joined", {
      ...gameState,
      playerId,
      playerIndex,
    });

    // Broadcast to all other players in the room that someone joined
    this.socket.to(roomID).emit("player-joined", {
      ...gameState,
      playerId,
      playerIndex,
    });

    // Check if game just started
    const shouldStartGame = game.shouldStartGame();

    // If game just started, broadcast game-started event to all players
    if (shouldStartGame) {
      const startGameData = {
        roomID: game.gameId,
        boardState: game.boardState,
        currentPlayer: game.currentPlayer,
      };

      this.socket.to(roomID).emit("game-started", startGameData);
      this.socket.emit("game-started", startGameData);
    }

    console.log(
      `User ${this.socket.id} added to room: ${roomID}. Players: ${
        game.playerCount
      }/4${shouldStartGame ? " - GAME STARTED!" : ""}`
    );

    // Debug: Visualize game state after join
    game.logGameState();
  };

  handlePlayerDisconnect = () => {
    console.log(`Player disconnected: ${this.socket.id}`);

    for (const [roomID, game] of this.games) {
      if (game.hasSocket(this.socket.id)) {
        const playerId = game.disconnectPlayer(this.socket.id);

        if (playerId) {
          this.socket.to(roomID).emit("player-disconnected", {
            playerId,
            players: game.players,
            connectedPlayers: game.getConnectedPlayerIds(),
          });
        }
        break;
      }
    }
  };
}
