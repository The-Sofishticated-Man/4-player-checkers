import type {
  GameState,
  PlayerClockMap,
  PlayerIndex,
} from "../../../shared/types/gameTypes.ts";

export const DEFAULT_CLOCK_BASE_TIME_MS = 5 * 60 * 1000;
export const DEFAULT_CLOCK_INCREMENT_MS = 0;
export const DEFAULT_CLOCK_SYNC_INTERVAL_MS = 250;

const createClockMap = (valueMs: number): PlayerClockMap => ({
  1: valueMs,
  2: valueMs,
  3: valueMs,
  4: valueMs,
});

const getActivePlayers = (gameState: GameState): PlayerIndex[] =>
  gameState.activePlayers ?? [1, 2, 3, 4];

const shouldClockRun = (gameState: GameState): boolean =>
  Boolean(gameState.gameStarted && !gameState.gameOver);

const resolveRunningPlayer = (gameState: GameState): PlayerIndex | null => {
  const activePlayers = getActivePlayers(gameState);

  if (activePlayers.length === 0) {
    return null;
  }

  if (activePlayers.includes(gameState.currentPlayer)) {
    return gameState.currentPlayer;
  }

  return activePlayers[0] ?? null;
};

export const clampClockMs = (
  valueMs: unknown,
  fallbackMs: number,
  minMs = 0,
): number => {
  if (typeof valueMs !== "number" || Number.isNaN(valueMs)) {
    return fallbackMs;
  }

  return Math.max(minMs, Math.floor(valueMs));
};

export const cloneClockMap = (clockMap: PlayerClockMap): PlayerClockMap => ({
  1: clockMap[1],
  2: clockMap[2],
  3: clockMap[3],
  4: clockMap[4],
});

export const resetClock = (
  gameState: GameState,
  baseTimeMs = DEFAULT_CLOCK_BASE_TIME_MS,
  incrementMs = DEFAULT_CLOCK_INCREMENT_MS,
): void => {
  const safeBaseTimeMs = clampClockMs(baseTimeMs, DEFAULT_CLOCK_BASE_TIME_MS);
  const safeIncrementMs = clampClockMs(incrementMs, DEFAULT_CLOCK_INCREMENT_MS);

  gameState.clock.baseTimeMs = safeBaseTimeMs;
  gameState.clock.incrementMs = safeIncrementMs;
  gameState.clock.remainingMs = createClockMap(safeBaseTimeMs);
  gameState.clock.runningPlayer = null;
  gameState.clock.lastUpdatedAtMs = null;
  gameState.clock.paused = true;
};

export const pauseClock = (gameState: GameState): void => {
  gameState.clock.runningPlayer = null;
  gameState.clock.lastUpdatedAtMs = null;
  gameState.clock.paused = true;
};

export const setRunningClockPlayer = (
  gameState: GameState,
  player: PlayerIndex | null,
  nowMs = Date.now(),
): void => {
  if (!shouldClockRun(gameState) || player === null) {
    pauseClock(gameState);
    return;
  }

  const activePlayers = getActivePlayers(gameState);
  if (!activePlayers.includes(player)) {
    pauseClock(gameState);
    return;
  }

  gameState.clock.runningPlayer = player;
  gameState.clock.lastUpdatedAtMs = nowMs;
  gameState.clock.paused = false;
};

export const grantIncrement = (
  gameState: GameState,
  player: PlayerIndex,
): void => {
  if (gameState.clock.incrementMs <= 0) {
    return;
  }

  const currentRemaining = gameState.clock.remainingMs[player] ?? 0;
  if (currentRemaining <= 0) {
    return;
  }

  gameState.clock.remainingMs[player] =
    currentRemaining + gameState.clock.incrementMs;
};

export const advanceClock = (
  gameState: GameState,
  nowMs = Date.now(),
): PlayerIndex | null => {
  if (!shouldClockRun(gameState)) {
    pauseClock(gameState);
    return null;
  }

  if (gameState.clock.paused || gameState.clock.runningPlayer === null) {
    setRunningClockPlayer(gameState, resolveRunningPlayer(gameState), nowMs);
    return null;
  }

  const runningPlayer = gameState.clock.runningPlayer;
  const activePlayers = getActivePlayers(gameState);

  if (!activePlayers.includes(runningPlayer)) {
    setRunningClockPlayer(gameState, resolveRunningPlayer(gameState), nowMs);
    return null;
  }

  const lastUpdatedAtMs = gameState.clock.lastUpdatedAtMs;
  if (lastUpdatedAtMs === null) {
    gameState.clock.lastUpdatedAtMs = nowMs;
    return null;
  }

  const elapsedMs = Math.max(0, nowMs - lastUpdatedAtMs);
  if (elapsedMs === 0) {
    return null;
  }

  const currentRemainingMs = gameState.clock.remainingMs[runningPlayer] ?? 0;
  const nextRemainingMs = Math.max(0, currentRemainingMs - elapsedMs);
  gameState.clock.remainingMs[runningPlayer] = nextRemainingMs;
  gameState.clock.lastUpdatedAtMs = nowMs;

  if (nextRemainingMs === 0) {
    return runningPlayer;
  }

  return null;
};
