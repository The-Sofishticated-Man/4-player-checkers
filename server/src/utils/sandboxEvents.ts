import { Game } from "../models/Game.ts";
import { MIN_PLAYERS_TO_START, SANDBOX_MODE } from "./devSandbox.ts";
import type {
  BoardState,
  GameClockState,
  PlayerId,
  PlayerIndex,
  SerializedPlayerMap,
  SerializedGameState,
} from "../../../shared/types/gameTypes.ts";

export interface SandboxGetRoomStateParams {
  roomID: string;
}

export interface SandboxSetStateParams {
  roomID: string;
  boardState?: BoardState;
  currentPlayer?: PlayerIndex;
  gameStarted?: boolean;
  turnsWithoutProgress?: number;
  stallDrawFullRounds?: number;
}

export interface GameStateEventPayload {
  boardState: BoardState;
  currentPlayer: PlayerIndex;
  gameStarted: boolean;
  gameOver: boolean;
  winner: PlayerIndex | null;
  isDraw: boolean;
  activePlayers: PlayerIndex[];
  turnsWithoutProgress: number;
  stallDrawFullRounds: number;
  clock: GameClockState;
  serverNowMs: number;
  players: SerializedPlayerMap;
  connectedPlayers: string[];
}

export interface ClockSyncPayload {
  roomID: string;
  currentPlayer: PlayerIndex;
  gameStarted: boolean;
  gameOver: boolean;
  winner: PlayerIndex | null;
  isDraw: boolean;
  activePlayers: PlayerIndex[];
  clock: GameClockState;
  serverNowMs: number;
}

export interface SandboxRoomStatePayload {
  roomID: string;
  sandboxMode: boolean;
  minPlayersToStart: number;
  playerCount: number;
  connectedPlayerCount: number;
  players: PlayerId[];
  connectedPlayers: PlayerId[];
  gameState: SerializedGameState;
}

const cloneBoardState = (boardState: BoardState): BoardState =>
  boardState.map((row) => [...row]);

const cloneClockState = (clock: GameClockState): GameClockState => ({
  ...clock,
  remainingMs: {
    1: clock.remainingMs[1],
    2: clock.remainingMs[2],
    3: clock.remainingMs[3],
    4: clock.remainingMs[4],
  },
});

export const serializeGameState = (game: Game): SerializedGameState => ({
  ...game.gameState,
  boardState: cloneBoardState(game.gameState.boardState),
  clock: cloneClockState(game.gameState.clock),
  gameStarted: game.gameStarted,
  players: Array.from(game.players.entries()),
});

export const createGameStateEventPayload = (
  game: Game,
): GameStateEventPayload => {
  const serverNowMs = Date.now();

  return {
    boardState: cloneBoardState(game.gameState.boardState),
    currentPlayer: game.gameState.currentPlayer,
    gameStarted: game.gameStarted,
    gameOver: game.gameState.gameOver ?? false,
    winner: game.gameState.winner ?? null,
    isDraw: game.gameState.isDraw ?? false,
    activePlayers: game.gameState.activePlayers ?? [],
    turnsWithoutProgress: game.gameState.turnsWithoutProgress ?? 0,
    stallDrawFullRounds: game.gameState.stallDrawFullRounds ?? 20,
    clock: cloneClockState(game.gameState.clock),
    serverNowMs,
    players: Array.from(game.players.entries()),
    connectedPlayers: game.getConnectedPlayerIds(),
  };
};

export const createClockSyncPayload = (game: Game): ClockSyncPayload => {
  const serverNowMs = Date.now();

  return {
    roomID: game.gameId,
    currentPlayer: game.gameState.currentPlayer,
    gameStarted: game.gameStarted,
    gameOver: game.gameState.gameOver ?? false,
    winner: game.gameState.winner ?? null,
    isDraw: game.gameState.isDraw ?? false,
    activePlayers: game.gameState.activePlayers ?? [],
    clock: cloneClockState(game.gameState.clock),
    serverNowMs,
  };
};

export const createSandboxRoomStatePayload = (
  game: Game,
): SandboxRoomStatePayload => {
  const connectedPlayers = game.getConnectedPlayerIds();

  return {
    roomID: game.gameId,
    sandboxMode: SANDBOX_MODE,
    minPlayersToStart: MIN_PLAYERS_TO_START,
    playerCount: game.playerCount,
    connectedPlayerCount: connectedPlayers.length,
    players: Array.from(game.players.keys()),
    connectedPlayers,
    gameState: serializeGameState(game),
  };
};
