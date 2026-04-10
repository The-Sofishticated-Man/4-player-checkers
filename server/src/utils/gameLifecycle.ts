import {
  DEFAULT_STALL_DRAW_FULL_ROUNDS,
  evaluateGameStatus,
  getNextActivePlayer,
} from "../../../shared/logic/boardGameState.ts";
import { applyPlayerForfeit } from "../../../shared/logic/boardForfeit.ts";
import type { PlayerId, PlayerIndex } from "../../../shared/types/gameTypes.ts";
import { Game } from "../models/Game.ts";
import { pauseClock, setRunningClockPlayer } from "./gameClock.ts";

const getPlayerIdByIndex = (
  game: Game,
  playerIndex: PlayerIndex,
): PlayerId | undefined => Array.from(game.players.keys())[playerIndex - 1];

export const evaluateAndApplyGameStatus = (game: Game): PlayerIndex[] => {
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
};

export const eliminatePlayerFromGame = (
  game: Game,
  playerIndex: PlayerIndex,
  nowMs = Date.now(),
): void => {
  game.gameState.boardState = applyPlayerForfeit(
    game.gameState.boardState,
    playerIndex,
  );
  game.gameState.turnsWithoutProgress = 0;

  const playerId = getPlayerIdByIndex(game, playerIndex);
  if (playerId) {
    const playerState = game.players.get(playerId);
    if (playerState) {
      playerState.leftGame = true;
      playerState.isConnected = false;
    }
  }

  const activePlayers = evaluateAndApplyGameStatus(game);

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

  if (!game.gameStarted || game.gameState.gameOver) {
    pauseClock(game.gameState);
    return;
  }

  setRunningClockPlayer(game.gameState, game.gameState.currentPlayer, nowMs);
};
