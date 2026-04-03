import { Game } from "../models/Game.ts";
import { MIN_PLAYERS_TO_START, SANDBOX_MODE } from "./devSandbox.ts";
import type {
  BoardState,
  PlayerId,
  PlayerIndex,
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
}

export interface GameStateEventPayload {
  boardState: BoardState;
  currentPlayer: PlayerIndex;
  gameStarted: boolean;
  gameOver: boolean;
  winner: PlayerIndex | null;
  isDraw: boolean;
  activePlayers: PlayerIndex[];
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

export const serializeGameState = (game: Game): SerializedGameState => ({
  ...game.gameState,
  boardState: cloneBoardState(game.gameState.boardState),
  gameStarted: game.gameStarted,
  players: Array.from(game.players.entries()),
});

export const createGameStateEventPayload = (
  game: Game,
): GameStateEventPayload => ({
  boardState: cloneBoardState(game.gameState.boardState),
  currentPlayer: game.gameState.currentPlayer,
  gameStarted: game.gameStarted,
  gameOver: game.gameState.gameOver ?? false,
  winner: game.gameState.winner ?? null,
  isDraw: game.gameState.isDraw ?? false,
  activePlayers: game.gameState.activePlayers ?? [],
});

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
