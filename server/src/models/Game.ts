import { Socket } from "socket.io";
import {
  BoardState,
  CurrentPlayer,
  PlayerId,
  playerMap,
  SocketIdToPlayerIdMap,
} from "../../../shared/types/gameTypes";

export class Game {
  gameId: string;
  players: playerMap = new Map([]);
  public playerCount: number = 0;
  public boardState: BoardState;
  public currentPlayer: CurrentPlayer = 1;
  private socketToPlayer: SocketIdToPlayerIdMap = new Map([]);
  public gameStarted: boolean = false;
  private creatorSocket: Socket;

  constructor(gameId: string, initialBoard: BoardState, socket: Socket) {
    this.gameId = gameId;
    this.boardState = initialBoard;
    this.creatorSocket = socket;
    this.creatorSocket.join(gameId);
    this.creatorSocket.emit("game-created", { gameId: gameId });
    console.log(`Room created: ${gameId}`);
  }

  hasPlayer(playerId: PlayerId): boolean {
    return this.players.has(playerId);
  }

  addPlayer(playerId: PlayerId, socketId: string): void {
    this.players.set(playerId, { isConnected: true, leftGame: false });
    this.socketToPlayer.set(socketId, playerId);
    this.playerCount++;

    // Start game when 4 players have joined
    if (this.playerCount === 4) {
      this.startGame();
    }
  }

  getPlayerIndexFromId(playerId: PlayerId): number {
    return Array.from(this.players.keys()).indexOf(playerId) + 1; // 1-based index
  }

  startGame() {
    this.gameStarted = true;
    console.log(
      `🎮 Game started in room: ${this.gameId} - All 4 players connected!`
    );
  }

  /**
   * Handles player reconnection by updating socket mapping
   */
  reconnectPlayer(playerId: PlayerId, socket: Socket): void {
    this.socketToPlayer.set(socket.id, playerId);
    socket.join(this.gameId);

    // Update player connection status
    const playerData = this.players.get(playerId);
    if (playerData) {
      playerData.isConnected = true;
    }

    console.log(`Player ${playerId} reconnected to room: ${this.gameId}`);
  }

  /**
   * Handles player disconnection by removing socket mapping
   */
  disconnectPlayer(socketId: string): PlayerId | null {
    const playerId = this.socketToPlayer.get(socketId);
    if (playerId) {
      this.socketToPlayer.delete(socketId);

      // Update player connection status
      const playerData = this.players.get(playerId);
      if (playerData) {
        playerData.isConnected = false;
      }

      console.log(`Player ${playerId} disconnected from room ${this.gameId}`);
      return playerId;
    }
    return null;
  }

  /**
   * Gets the current game state information for client communication
   */
  getGameStateInfo() {
    return {
      roomID: this.gameId,
      boardState: this.boardState,
      currentPlayer: this.currentPlayer,
      gameStarted: this.gameStarted,
      players: this.players,
      connectedPlayers: Array.from(this.socketToPlayer.values()),
    };
  }

  /**
   * Gets connected player IDs
   */
  getConnectedPlayerIds(): PlayerId[] {
    return Array.from(this.socketToPlayer.values());
  }

  /**
   * Checks if the game should start (4 players joined)
   */
  shouldStartGame(): boolean {
    return this.gameStarted && this.playerCount === 4;
  }

  /**
   * Checks if the game is full (4 players)
   */
  isFull(): boolean {
    return this.playerCount >= 4;
  }

  /**
   * Gets the number of connected players
   */
  getConnectedPlayerCount(): number {
    return this.socketToPlayer.size;
  }

  /**
   * Checks if a socket ID is associated with a player in this game
   */
  hasSocket(socketId: string): boolean {
    return this.socketToPlayer.has(socketId);
  }

  /**
   * Gets the player ID associated with a socket ID
   */
  getPlayerFromSocket(socketId: string): PlayerId | undefined {
    return this.socketToPlayer.get(socketId);
  }

  /**
   * Debug method to log current game state
   */
  logGameState(): void {
    console.log(`\n🎮 GAME STATE - Room: ${this.gameId}`);
    console.log(`👥 Players: [${Array.from(this.players.keys()).join(", ")}]`);
    console.log(`🎯 Current Player: ${this.currentPlayer}`);
    console.log(`🔌 Socket to Player mapping:`);
    console.table(Object.fromEntries(this.socketToPlayer));
    console.log(`📊 Player positions:`);
    Array.from(this.players.keys()).forEach((playerId, index) => {
      const isCurrentTurn = this.currentPlayer === index + 1;
      console.log(
        `   Player ${index + 1}: ${playerId} ${
          isCurrentTurn ? "🔥 (CURRENT TURN)" : ""
        }`
      );
    });
  }
}
