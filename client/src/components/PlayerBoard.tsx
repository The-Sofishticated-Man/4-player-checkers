import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import {
  FiCheckCircle,
  FiCopy,
  FiClock,
  FiUserX,
  FiUsers,
  FiWifiOff,
} from "react-icons/fi";
import { useNavigate } from "react-router";
import useGameState from "../hooks/useBoard";
import { useSocket } from "../hooks/useSocket";
import {
  loadingSlots,
  type PlayerSlot,
  type PlayerTheme,
} from "../types/playerBoardTypes";
import { getPlayerTheme, panelTheme } from "../utils/playerBoardThemes";

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

type RoomLinkFieldProps = {
  roomLink: string;
  linkCopied: boolean;
  onCopy: () => void;
};

function RoomLinkField({ roomLink, linkCopied, onCopy }: RoomLinkFieldProps) {
  if (!roomLink) {
    return null;
  }

  return (
    <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        Room Link
      </div>
      <div className="relative">
        <input
          type="text"
          readOnly
          value={roomLink}
          aria-label="Room link"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-3 pr-11 font-mono text-[11px] text-slate-700 outline-none"
          onFocus={(event) => event.currentTarget.select()}
        />
        <button
          type="button"
          onClick={onCopy}
          className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center rounded-r-xl border-l border-slate-200 bg-slate-100 text-slate-600 transition-transform duration-200 hover:bg-slate-200"
          aria-label={linkCopied ? "Copied room link" : "Copy room link"}
          title={linkCopied ? "Copied" : "Copy room link"}
        >
          <FiCopy className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

type ActionRowProps = {
  playerIndex: number;
  gameOver: boolean;
  isForfeiting: boolean;
  isYouForfeited: boolean;
  onForfeit: () => void;
  onExit: () => void;
};

function ActionRow({
  playerIndex,
  gameOver,
  isForfeiting,
  isYouForfeited,
  onForfeit,
  onExit,
}: ActionRowProps) {
  return (
    <div className="mt-3 flex items-center justify-end gap-2">
      {playerIndex > 0 && !gameOver && (
        <button
          type="button"
          onClick={onForfeit}
          disabled={isForfeiting || isYouForfeited}
          className="rounded-full border border-slate-300 bg-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-md shadow-slate-300/60 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="inline-flex items-center gap-1.5">
            <FiUserX className="h-3.5 w-3.5" />
            <span>
              {isYouForfeited
                ? "FORFEITED"
                : isForfeiting
                  ? "LEAVING..."
                  : "FORFEIT"}
            </span>
          </span>
        </button>
      )}

      {playerIndex > 0 && gameOver && (
        <button
          type="button"
          onClick={onExit}
          className="rounded-full border border-slate-300 bg-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-md shadow-slate-300/60 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-slate-300"
        >
          EXIT
        </button>
      )}
    </div>
  );
}

type StatusBannerProps = {
  icon?: ReactNode;
  text: ReactNode;
  className?: string;
};

function StatusBanner({ icon, text, className = "" }: StatusBannerProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-700 shadow-lg ${className}`}
    >
      <span className="inline-flex items-center gap-2">
        {icon}
        <span>{text}</span>
      </span>
    </div>
  );
}

type PlayerSlotCardProps = {
  slotNumber: PlayerSlot;
  theme: PlayerTheme;
  isCurrentTurn: boolean;
  isYou: boolean;
  playerId?: string;
  nickname?: string;
  isConnected: boolean;
  hasLeftGame: boolean;
  isDefeated: boolean;
  remainingMs: number;
  clockLabel: string;
};

function PlayerSlotCard({
  slotNumber,
  theme,
  isCurrentTurn,
  isYou,
  playerId,
  nickname,
  isConnected,
  hasLeftGame,
  isDefeated,
  remainingMs,
  clockLabel,
}: PlayerSlotCardProps) {
  const isDisconnected = Boolean(playerId) && !isConnected && !hasLeftGame;
  const isLowTime = remainingMs <= 10_000;
  const isOutOfTime = remainingMs === 0;
  const displayName = playerId
    ? (nickname ?? `P_${playerId}`)
    : `${theme.name} Slot`;

  const cardBackground = !playerId
    ? "linear-gradient(135deg, rgba(247, 244, 241, 0.96), rgba(255, 255, 255, 0.8))"
    : hasLeftGame
      ? "linear-gradient(135deg, rgba(233, 236, 241, 0.97), rgba(245, 247, 250, 0.94))"
      : isDisconnected
        ? "linear-gradient(135deg, rgba(228, 233, 240, 0.97), rgba(243, 247, 252, 0.94))"
        : isDefeated
          ? "linear-gradient(135deg, rgba(233, 237, 243, 0.97), rgba(246, 249, 252, 0.94))"
          : isCurrentTurn
            ? `linear-gradient(135deg, ${theme.surfaceActive}, ${theme.surface})`
            : `linear-gradient(135deg, ${theme.surface}, rgba(255, 255, 255, 0.82))`;

  const cardStyle: CSSProperties = {
    background: cardBackground,
    borderColor: hasLeftGame
      ? "rgba(127, 139, 156, 0.84)"
      : isDisconnected
        ? "rgba(134, 146, 164, 0.82)"
        : isDefeated
          ? "rgba(150, 164, 184, 0.76)"
          : theme.border,
    boxShadow: isCurrentTurn
      ? `0 20px 36px ${theme.glow}`
      : "0 10px 22px rgba(46, 55, 68, 0.1)",
    transform: isCurrentTurn ? "scale(1.065)" : "scale(1)",
  };

  const statusLabel = playerId
    ? hasLeftGame
      ? "Forfeited"
      : isDefeated
        ? "Defeated"
        : isConnected
          ? "Online"
          : "Disconnected"
    : "Waiting...";

  const statusColor = hasLeftGame
    ? "#586779"
    : isDisconnected
      ? "#5b6b7f"
      : isDefeated
        ? "#5f6e82"
        : playerId
          ? theme.mutedText
          : "var(--app-muted)";

  const statusIcon = !playerId ? (
    <FiUsers className="h-3.5 w-3.5" />
  ) : hasLeftGame ? (
    <FiUserX className="h-3.5 w-3.5" />
  ) : isDisconnected ? (
    <FiWifiOff className="h-3.5 w-3.5" />
  ) : isConnected ? (
    <FiCheckCircle className="h-3.5 w-3.5" />
  ) : null;

  return (
    <div
      className={`relative flex origin-center items-center justify-between gap-4 overflow-hidden rounded-2xl border px-4 py-3 transition-all duration-300 ease-out ${
        hasLeftGame ? "opacity-85" : ""
      } ${isDefeated ? "opacity-80" : ""}`}
      style={cardStyle}
    >
      <div className="z-10 flex min-w-0 items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 shadow-sm ${
            !playerId
              ? "opacity-65"
              : hasLeftGame || isDefeated
                ? "opacity-80 grayscale"
                : ""
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
          <div
            className="flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: statusColor }}
          >
            {statusIcon}
            <span>{statusLabel}</span>
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
  const connectedPlayers = playerEntries.filter(
    ([, player]) => player.isConnected,
  );
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
  const roomLink = roomId
    ? new URL(`/game/${roomId}`, window.location.origin).toString()
    : "";

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
    if (!roomLink) {
      return;
    }

    let copied = false;

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(roomLink);
        copied = true;
      } catch {
        copied = false;
      }
    }

    if (!copied) {
      copied = fallbackCopyToClipboard(roomLink);
    }

    if (!copied) {
      alert("Unable to copy the game link right now.");
      return;
    }

    setLinkCopied(true);
    window.setTimeout(() => setLinkCopied(false), 1800);
  };

  const handleForfeitGame = () => {
    if (
      !socket ||
      !roomId ||
      playerIndex <= 0 ||
      isForfeiting ||
      isYouForfeited
    ) {
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
    const playerEntry = playerEntries[slotNumber - 1];
    const playerId = playerEntry?.[0];
    const nickname = playerEntry?.[1].nickname;
    const isConnected = Boolean(playerEntry?.[1].isConnected);
    const hasLeftGame = Boolean(playerEntry?.[1].leftGame);
    const isDefeated =
      Boolean(playerId) && defeatedPlayers.includes(slotNumber);
    const remainingMs = getDisplayRemainingMs(slotNumber);

    return (
      <PlayerSlotCard
        key={slotNumber}
        slotNumber={slotNumber}
        theme={theme}
        isCurrentTurn={currentPlayer === slotNumber}
        isYou={playerIndex === slotNumber}
        playerId={playerId}
        nickname={nickname}
        isConnected={isConnected}
        hasLeftGame={hasLeftGame}
        isDefeated={isDefeated}
        remainingMs={remainingMs}
        clockLabel={formatClock(remainingMs)}
      />
    );
  };

  return (
    <div
      className="fixed top-4 right-4 w-[360px] max-w-[calc(100vw-2rem)] rounded-3xl border p-4 backdrop-blur-md"
      style={panelTheme}
    >
      {isYouForfeited && gameStarted && !gameOver && (
        <StatusBanner
          className="mb-3"
          icon={<FiUserX className="h-4 w-4" />}
          text="YOU FORFEITED THIS GAME"
        />
      )}

      {!isYouForfeited && isYouDefeated && gameStarted && !gameOver && (
        <StatusBanner className="mb-3" text="YOU ARE DEFEATED - TURN SKIPPED" />
      )}

      {!gameStarted && !gameOver && (
        <StatusBanner
          className="mb-3"
          icon={<FiClock className="h-4 w-4" />}
          text={`WAITING FOR PLAYERS (${playerEntries.length}/4)`}
        />
      )}

      {gameOver && (
        <div
          className="mb-3 rounded-2xl px-4 py-3 text-center text-sm font-semibold text-white shadow-lg"
          style={{
            background: isDraw
              ? "linear-gradient(135deg, #8f98a7, #6f7884)"
              : "linear-gradient(135deg, #d8788d, #c86074)",
          }}
        >
          {isDraw ? "DRAW" : `GAME OVER - PLAYER ${winner} WINS`}
        </div>
      )}

      {gameStarted &&
        !gameOver &&
        connectedPlayerIds.length < playerEntries.length && (
          <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-700 shadow-lg">
            <span className="inline-flex items-center gap-2">
              <FiWifiOff className="h-4 w-4" />
              <span>GAME IN PROGRESS</span>
            </span>
            <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold">
              {playerEntries.length - connectedPlayerIds.length} DISCONNECTED
            </span>
          </div>
        )}

      <div className="space-y-3">{playerSlots.map(renderPlayerSlot)}</div>

      <RoomLinkField
        roomLink={roomLink}
        linkCopied={linkCopied}
        onCopy={handleCopyGameLink}
      />
      <ActionRow
        playerIndex={playerIndex}
        gameOver={!!gameOver}
        isForfeiting={isForfeiting}
        isYouForfeited={isYouForfeited}
        onForfeit={handleForfeitGame}
        onExit={() => {
          sessionStorage.removeItem("currentRoomId");
          navigate("/");
        }}
      />
    </div>
  );
}

export default PlayerBoard;
