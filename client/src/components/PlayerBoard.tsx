import { useEffect, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router";
import useGameState from "../hooks/useBoard";
import { useSocket } from "../hooks/useSocket";

const loadingSlots = [1, 2, 3, 4] as const;

type PlayerSlot = (typeof loadingSlots)[number];

type PlayerTheme = {
  name: string;
  surface: string;
  surfaceActive: string;
  border: string;
  accent: string;
  text: string;
  mutedText: string;
  glow: string;
  chipText: string;
};

const playerThemes: Record<PlayerSlot, PlayerTheme> = {
  1: {
    name: "Red",
    surface: "var(--player-1-surface)",
    surfaceActive: "var(--player-1-surface-strong)",
    border: "var(--player-1-border)",
    accent: "var(--player-1-accent)",
    text: "var(--player-1-text)",
    mutedText: "var(--player-1-muted)",
    glow: "rgba(190, 111, 120, 0.24)",
    chipText: "var(--player-1-text)",
  },
  2: {
    name: "Blue",
    surface: "var(--player-2-surface)",
    surfaceActive: "var(--player-2-surface-strong)",
    border: "var(--player-2-border)",
    accent: "var(--player-2-accent)",
    text: "var(--player-2-text)",
    mutedText: "var(--player-2-muted)",
    glow: "rgba(111, 151, 204, 0.24)",
    chipText: "var(--player-2-text)",
  },
  3: {
    name: "Green",
    surface: "var(--player-3-surface)",
    surfaceActive: "var(--player-3-surface-strong)",
    border: "var(--player-3-border)",
    accent: "var(--player-3-accent)",
    text: "var(--player-3-text)",
    mutedText: "var(--player-3-muted)",
    glow: "rgba(103, 172, 137, 0.24)",
    chipText: "var(--player-3-text)",
  },
  4: {
    name: "Yellow",
    surface: "var(--player-4-surface)",
    surfaceActive: "var(--player-4-surface-strong)",
    border: "var(--player-4-border)",
    accent: "var(--player-4-accent)",
    text: "var(--player-4-text)",
    mutedText: "var(--player-4-muted)",
    glow: "rgba(202, 162, 74, 0.24)",
    chipText: "var(--player-4-text)",
  },
};

const panelTheme = {
  fontFamily: '"Avenir Next", "Nunito", "Segoe UI", "SF Pro Rounded", sans-serif',
  background:
    "linear-gradient(180deg, rgba(255, 252, 248, 0.92) 0%, rgba(255, 247, 241, 0.94) 100%)",
  borderColor: "var(--app-border)",
  color: "var(--app-text)",
  boxShadow: "var(--card-shadow)",
} as CSSProperties;

function getPlayerTheme(playerNum: number): PlayerTheme {
  return playerThemes[playerNum as PlayerSlot] ?? playerThemes[1];
}

export function PlayerBoardSkeleton() {
  return (
    <div
      className="fixed top-4 right-4 w-[360px] max-w-[calc(100vw-2rem)] rounded-3xl border p-4 backdrop-blur-md"
      style={panelTheme}
    >
      <div className="animate-pulse space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="h-5 w-24 rounded-full bg-slate-200" />
          <div className="h-8 w-40 rounded-full bg-slate-200" />
        </div>

        <div className="space-y-3">
          {loadingSlots.map((slot) => (
            <div
              key={slot}
              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-slate-300" />
                <div className="space-y-2">
                  <div className="h-3.5 w-24 rounded bg-slate-300" />
                  <div className="h-2.5 w-16 rounded bg-slate-200" />
                </div>
              </div>
              <div className="h-7 w-14 rounded-full bg-slate-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlayerBoard() {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [isForfeiting, setIsForfeiting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const {
    gameState: {
      currentPlayer,
      players,
      gameStarted,
      gameOver,
      winner,
      isDraw,
      activePlayers,
      clock,
    },
    playerIndex,
  } = useGameState();
  const [clockNowMs, setClockNowMs] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setClockNowMs(Date.now());
    }, 200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const formatClock = (remainingMs: number): string => {
    const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");

    return `${minutes}:${seconds}`;
  };

  const getDisplayRemainingMs = (slotNumber: number): number => {
    const slot = slotNumber as PlayerSlot;
    const baseRemainingMs = clock.remainingMs[slot] ?? 0;

    if (
      clock.paused ||
      clock.runningPlayer !== slot ||
      clock.lastUpdatedAtMs === null ||
      gameOver
    ) {
      return baseRemainingMs;
    }

    const elapsedMs = Math.max(0, clockNowMs - clock.lastUpdatedAtMs);
    return Math.max(0, baseRemainingMs - elapsedMs);
  };

  const playerEntries = Array.from(players.entries());
  const connectedPlayers = playerEntries.filter(([, player]) => player.isConnected);
  const connectedPlayerIds = connectedPlayers.map(([playerId]) => playerId);
  const playerSlots = loadingSlots;
  const forfeitedPlayers = playerSlots.filter((slot) =>
    Boolean(playerEntries[slot - 1]?.[1].leftGame),
  );
  const defeatedPlayers = playerSlots.filter(
    (slot) => !(activePlayers ?? playerSlots).includes(slot),
  );
  const isYouForfeited =
    playerIndex > 0 && forfeitedPlayers.includes(playerIndex as PlayerSlot);
  const isYouDefeated =
    playerIndex > 0 && defeatedPlayers.includes(playerIndex as PlayerSlot);
  const roomId = sessionStorage.getItem("currentRoomId");

  const fallbackCopyToClipboard = (text: string): boolean => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textArea);
    return copied;
  };

  const handleCopyGameLink = async () => {
    if (!roomId) {
      return;
    }

    const gameLink = new URL(`/game/${roomId}`, window.location.origin).toString();
    let copied = false;

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(gameLink);
        copied = true;
      } catch {
        copied = false;
      }
    }

    if (!copied) {
      copied = fallbackCopyToClipboard(gameLink);
    }

    if (!copied) {
      alert("Unable to copy the game link right now.");
      return;
    }

    setLinkCopied(true);
    window.setTimeout(() => setLinkCopied(false), 1800);
  };

  const handleForfeitGame = () => {
    if (!socket || !roomId || playerIndex <= 0 || isForfeiting || isYouForfeited) {
      return;
    }

    const confirmed = window.confirm(
      "Forfeit this game and leave the room? This cannot be undone.",
    );
    if (!confirmed) {
      return;
    }

    setIsForfeiting(true);
    socket.emit(
      "forfeit-game",
      roomId,
      (response?: { ok: boolean; message?: string }) => {
        setIsForfeiting(false);

        if (!response?.ok) {
          alert(response?.message ?? "Unable to forfeit right now");
          return;
        }

        sessionStorage.removeItem("currentRoomId");
        navigate("/");
      },
    );
  };

  const renderPlayerSlot = (slotNumber: PlayerSlot) => {
    const theme = getPlayerTheme(slotNumber);
    const isCurrentTurn = currentPlayer === slotNumber;
    const isYou = playerIndex === slotNumber;
    const playerEntry = playerEntries[slotNumber - 1];
    const playerId = playerEntry?.[0];
    const nickname = playerEntry?.[1].nickname;
    const isConnected = Boolean(playerEntry?.[1].isConnected);
    const hasLeftGame = Boolean(playerEntry?.[1].leftGame);
    const isDefeated = Boolean(playerId) && defeatedPlayers.includes(slotNumber);
    const remainingMs = getDisplayRemainingMs(slotNumber);
    const clockLabel = formatClock(remainingMs);
    const isLowTime = remainingMs <= 10_000;
    const isOutOfTime = remainingMs === 0;
    const displayName = playerId ? (nickname ?? `P_${playerId}`) : `${theme.name} Slot`;

    const cardBackground = !playerId
      ? "linear-gradient(135deg, rgba(247, 244, 241, 0.96), rgba(255, 255, 255, 0.8))"
      : hasLeftGame
        ? "linear-gradient(135deg, rgba(252, 232, 236, 0.96), rgba(255, 255, 255, 0.8))"
        : isDefeated
          ? "linear-gradient(135deg, rgba(241, 243, 246, 0.96), rgba(255, 255, 255, 0.8))"
          : isCurrentTurn
            ? `linear-gradient(135deg, ${theme.surfaceActive}, ${theme.surface})`
            : `linear-gradient(135deg, ${theme.surface}, rgba(255, 255, 255, 0.82))`;

    const cardStyle: CSSProperties = {
      background: cardBackground,
      borderColor: hasLeftGame
        ? "rgba(232, 164, 173, 0.76)"
        : isDefeated
          ? "rgba(186, 195, 206, 0.72)"
          : theme.border,
      boxShadow: isCurrentTurn
        ? `0 18px 32px ${theme.glow}`
        : "0 10px 24px rgba(114, 92, 86, 0.08)",
      transform: isCurrentTurn ? "scale(1.03)" : "scale(1)",
    };

    return (
      <div
        key={slotNumber}
        className={`relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl border px-4 py-3 transition-all duration-300 ease-out ${
          hasLeftGame ? "opacity-85" : ""
        } ${isDefeated ? "opacity-80" : ""}`}
        style={cardStyle}
      >
        <div className="z-10 flex min-w-0 items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 shadow-sm ${
              !playerId ? "opacity-65" : hasLeftGame || isDefeated ? "opacity-80 grayscale" : ""
            }`}
            style={{
              background: playerId
                ? `linear-gradient(135deg, ${theme.accent}, ${theme.border})`
                : "linear-gradient(135deg, rgba(212, 205, 199, 0.95), rgba(231, 225, 220, 0.95))",
              borderColor: playerId ? theme.border : "rgba(194, 186, 180, 0.8)",
            }}
          >
            <span className="text-sm font-bold text-white">{slotNumber}</span>
          </div>

          <div className="min-w-0">
            <div
              className="truncate text-[15px] font-semibold tracking-tight"
              style={{ color: playerId ? theme.text : "var(--app-muted)" }}
            >
              {displayName}
              {isYou && playerId ? " (You)" : ""}
            </div>
            <div className="text-xs" style={{ color: playerId ? theme.mutedText : "var(--app-muted)" }}>
              {playerId
                ? hasLeftGame
                  ? "Forfeited"
                  : isDefeated
                    ? "Defeated"
                    : isConnected
                      ? "Online"
                      : "Disconnected"
                : "Waiting..."}
            </div>
          </div>
        </div>

        <div
          className="z-10 rounded-full border px-2.5 py-1 text-xs font-semibold tabular-nums shadow-sm"
          style={{
            color: isOutOfTime
              ? "#7b3142"
              : isLowTime
                ? theme.chipText
                : theme.text,
            background: isOutOfTime
              ? "rgba(251, 231, 235, 0.95)"
              : isLowTime
                ? "rgba(255, 246, 219, 0.95)"
                : "rgba(255, 255, 255, 0.55)",
            borderColor: isOutOfTime
              ? "rgba(221, 140, 159, 0.62)"
              : isLowTime
                ? "rgba(230, 193, 117, 0.62)"
                : theme.border,
          }}
        >
          {clockLabel}
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed top-4 right-4 w-[360px] max-w-[calc(100vw-2rem)] rounded-3xl border p-4 backdrop-blur-md"
      style={panelTheme}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ background: "linear-gradient(135deg, var(--player-2-accent), var(--player-1-accent))" }}
          />
          <h2 className="text-base font-semibold tracking-tight" style={{ color: "var(--app-text)" }}>
            Players
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {roomId && (
            <div
              className="rounded-full px-3 py-1 shadow-sm"
              style={{
                background: "var(--app-surface-strong)",
                border: "1px solid var(--app-border)",
              }}
            >
              <span className="text-xs" style={{ color: "var(--app-muted)" }}>
                Room
              </span>
              <span className="ml-1 font-mono text-xs font-semibold" style={{ color: "var(--app-text)" }}>
                {roomId}
              </span>
            </div>
          )}

          {roomId && (
            <button
              type="button"
              onClick={handleCopyGameLink}
              className="rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
              style={{
                background:
                  "linear-gradient(135deg, var(--player-2-accent), var(--player-2-border))",
              }}
            >
              {linkCopied ? "COPIED" : "COPY"}
            </button>
          )}

          {playerIndex > 0 && !gameOver && (
            <button
              type="button"
              onClick={handleForfeitGame}
              disabled={isForfeiting || isYouForfeited}
              className="rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #e88795, #d96b7d)" }}
            >
              {isYouForfeited ? "FORFEITED" : isForfeiting ? "LEAVING..." : "FORFEIT"}
            </button>
          )}

          {playerIndex > 0 && gameOver && (
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem("currentRoomId");
                navigate("/");
              }}
              className="rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #a2adb9, #7f8a95)" }}
            >
              EXIT
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">{playerSlots.map(renderPlayerSlot)}</div>

      {isYouForfeited && gameStarted && !gameOver && (
        <div
          className="mt-4 rounded-2xl px-4 py-3 text-center text-sm font-semibold text-white shadow-lg"
          style={{ background: "linear-gradient(135deg, #e88795, #d96b7d)" }}
        >
          YOU FORFEITED THIS GAME
        </div>
      )}

      {!isYouForfeited && isYouDefeated && gameStarted && !gameOver && (
        <div
          className="mt-4 rounded-2xl px-4 py-3 text-center text-sm font-semibold text-white shadow-lg"
          style={{ background: "linear-gradient(135deg, #d88e9b, #c86b79)" }}
        >
          YOU ARE DEFEATED - TURN SKIPPED
        </div>
      )}

      {!gameStarted && !gameOver && (
        <div
          className="mt-4 rounded-2xl px-4 py-3 text-center text-sm font-semibold text-white shadow-lg"
          style={{ background: "linear-gradient(135deg, #efb36a, #e98970)" }}
        >
          WAITING FOR PLAYERS ({playerEntries.length}/4)
        </div>
      )}

      {gameOver && (
        <div
          className="mt-4 rounded-2xl px-4 py-3 text-center text-sm font-semibold text-white shadow-lg"
          style={{
            background: isDraw
              ? "linear-gradient(135deg, #8f98a7, #6f7884)"
              : "linear-gradient(135deg, #d8788d, #c86074)",
          }}
        >
          {isDraw ? "DRAW" : `GAME OVER - PLAYER ${winner} WINS`}
        </div>
      )}

      {gameStarted && !gameOver && connectedPlayerIds.length < playerEntries.length && (
        <div
          className="mt-4 rounded-2xl px-4 py-3 text-center text-sm font-semibold text-white shadow-lg"
          style={{ background: "linear-gradient(135deg, #89a9ef, #a57de0)" }}
        >
          GAME IN PROGRESS
          <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold">
            {playerEntries.length - connectedPlayerIds.length} DISCONNECTED
          </span>
        </div>
      )}
    </div>
  );
}

export default PlayerBoard;
