import {
  PlayerId,
  PlayerMap,
  GameState,
} from "../../../shared/types/gameTypes.ts";
import { createInitialGameState } from "../utils/initialGameState.ts";
import { MIN_PLAYERS_TO_START, SANDBOX_MODE } from "../utils/devSandbox.ts";
import {
  DEFAULT_CLOCK_BASE_TIME_MS,
  DEFAULT_CLOCK_INCREMENT_MS,
  clampClockMs,
  resetClock,
  setRunningClockPlayer,
} from "../utils/gameClock.ts";

const parseClockEnvMs = (rawValue: string | undefined, fallbackMs: number) => {
  if (!rawValue) {
    return fallbackMs;
  }

  const parsed = Number(rawValue);
  return clampClockMs(parsed, fallbackMs);
};

const SERVER_CLOCK_BASE_TIME_MS = parseClockEnvMs(
  process.env.CHECKERS_BASE_TIME_MS,
  DEFAULT_CLOCK_BASE_TIME_MS,
);
const SERVER_CLOCK_INCREMENT_MS = parseClockEnvMs(
  process.env.CHECKERS_INCREMENT_MS,
  DEFAULT_CLOCK_INCREMENT_MS,
);

export class Game {
  gameId: string;
  players: PlayerMap = new Map([]);
  public playerCount: number = 0;
  public gameState: GameState = createInitialGameState();
  public gameStarted: boolean = false;

  constructor(gameId: string) {
    this.gameId = gameId;
    resetClock(
      this.gameState,
      SERVER_CLOCK_BASE_TIME_MS,
      SERVER_CLOCK_INCREMENT_MS,
    );
    console.log(`Room created: ${gameId}`);
  }

  hasPlayer(playerId: PlayerId): boolean {
    return this.players.has(playerId);
  }

  addNewPlayer(playerId: PlayerId, nickname: string): void {
    this.players.set(playerId, {
      isConnected: true,
      leftGame: false,
      nickname,
    });
    this.playerCount++;

    // In sandbox mode, allow instant start with fewer players.
    if (!this.gameStarted && this.playerCount >= MIN_PLAYERS_TO_START) {
      this.startGame();
    }
  }

  getPlayerIndexFromId(playerId: PlayerId): number {
    return Array.from(this.players.keys()).indexOf(playerId) + 1; // 1-based index
  }

  startGame() {
    this.gameStarted = true;
    this.gameState.gameStarted = true;
    setRunningClockPlayer(this.gameState, this.gameState.currentPlayer);
    console.log(
      SANDBOX_MODE
        ? `🎮 Sandbox game started in room: ${this.gameId} (${this.playerCount} player connected)`
        : `🎮 Game started in room: ${this.gameId} - All 4 players connected!`,
    );
  }

  /**
   * Handles player reconnection by updating socket mapping
   */
  reconnectPlayer(playerId: PlayerId, nickname: string): void {
    // Update player connection status
    const playerData = this.players.get(playerId);
    if (playerData) {
      playerData.isConnected = true;
      playerData.nickname = nickname;
    }

    console.log(`Player ${playerId} reconnected to room: ${this.gameId}`);
  }

  /**
   * Handles player disconnection by removing socket mapping
   */
  disconnectPlayer(playerId: PlayerId): PlayerId | null {
    const playerData = this.players.get(playerId);
    if (!playerData) {
      return null;
    }

    playerData.isConnected = false;
    console.log(`Player ${playerId} disconnected from room ${this.gameId}`);
    return playerId;
  }

  /**
   * Gets the current game state information for client communication
   */
  getGameStateInfo() {
    return {
      gameID: this.gameId,
      gameState: this.gameState,
    };
  }

  /**
   * Gets connected player IDs
   */
  getConnectedPlayerIds(): PlayerId[] {
    return Array.from(this.players.entries())
      .filter(([, player]) => player.isConnected)
      .map(([playerId]) => playerId);
  }

  /**
   * Checks if the game should start (4 players joined)
   */
  shouldStartGame(): boolean {
    return this.gameStarted && this.playerCount >= MIN_PLAYERS_TO_START;
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
    let count = 0;
    for (const player of this.players.values()) {
      if (player.isConnected) {
        count++;
      }
    }
    return count;
  }

  /**
   * Debug method to log current game state
   */
  logGameState(): void {
    console.log(`\n🎮 GAME STATE - Room: ${this.gameId}`);
    console.log(`👥 Players: [${Array.from(this.players.keys()).join(", ")}]`);
    console.log(`🎯 Current Player: ${this.gameState.currentPlayer}`);
    console.log(
      `🔌 Connected players: [${this.getConnectedPlayerIds().join(", ")}]`,
    );
    console.log(`📊 Player positions:`);
    Array.from(this.players.keys()).forEach((playerId, index) => {
      const isCurrentTurn = this.gameState.currentPlayer === index + 1;
      console.log(
        `   Player ${index + 1}: ${playerId} ${
          isCurrentTurn ? "🔥 (CURRENT TURN)" : ""
        }`,
      );
    });
  }
}
