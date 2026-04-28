import { FiClock, FiUserX, FiUsers, FiWifiOff } from "react-icons/fi";
import type { PlayerSlot, PlayerTheme } from "../types/playerBoardTypes";

type PlayerCornerCardProps = {
  slotNumber: PlayerSlot;
  theme: PlayerTheme;
  timerEdge: "top" | "bottom";
  isCurrentTurn: boolean;
  isYou: boolean;
  playerId?: string;
  nickname?: string;
  isConnected: boolean;
  hasLeftGame: boolean;
  isDefeated: boolean;
  clockLabel: string;
};

function PlayerCornerCard({
  slotNumber,
  theme,
  timerEdge,
  isCurrentTurn,
  isYou,
  playerId,
  nickname,
  isConnected,
  hasLeftGame,
  isDefeated,
  clockLabel,
}: PlayerCornerCardProps) {
  const isDisconnected = Boolean(playerId) && !isConnected && !hasLeftGame;
  const displayName = playerId
    ? (nickname ?? `P_${playerId}`)
    : `${theme.name} Slot`;

  const statusLabel = playerId
    ? hasLeftGame
      ? "Forfeited"
      : isDefeated
        ? "Defeated"
        : isConnected
          ? "Online"
          : "Disconnected"
    : "Waiting";

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
  ) : (
    <span
      className="h-2.5 w-2.5 rounded-full"
      style={{ background: "#22c55e" }}
      aria-hidden="true"
    />
  );

  const baseRibbonColor = !playerId
    ? "rgba(111, 123, 140, 0.88)"
    : isCurrentTurn
      ? `color-mix(in srgb, ${theme.accent} 74%, white 26%)`
      : `color-mix(in srgb, ${theme.accent} 72%, black 28%)`;

  const ribbonColor =
    hasLeftGame || isDefeated
      ? `color-mix(in srgb, ${baseRibbonColor} 62%, #374151 38%)`
      : baseRibbonColor;

  const timerButtonColor = playerId
    ? isCurrentTurn
      ? theme.pieceFill
      : `color-mix(in srgb, ${theme.pieceFill} 84%, black 16%)`
    : "rgba(20, 30, 45, 0.32)";

  const timerStrip = (
    <div
      className="-mx-2.5 flex items-center justify-between gap-2 rounded-none px-2 py-1.5"
      style={{
        background: ribbonColor,
      }}
    >
      <div
        className="inline-flex h-7 w-7 items-center justify-center rounded-md"
        style={{
          background: timerButtonColor,
          color: "rgba(244, 248, 255, 0.95)",
        }}
      >
        <FiClock className="h-4 w-4" />
      </div>

      <div className="min-w-0 text-right">
        <span
          className="block text-[1.62rem] font-extrabold leading-none tabular-nums tracking-[-0.04em]"
          style={{ color: "rgba(244, 248, 255, 0.98)" }}
        >
          {clockLabel}
        </span>
      </div>
    </div>
  );

  const playerMeta = (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <div
          className="truncate text-[15px] font-bold tracking-tight"
          style={{ color: "#111111" }}
        >
          {displayName}
          {isYou && playerId ? " (You)" : ""}
        </div>
        <div
          className="mt-0.5 inline-flex min-w-0 items-center gap-1.5 truncate text-[11px] font-semibold"
          style={{ color: statusColor }}
        >
          {statusIcon}
          <span className="truncate">{statusLabel}</span>
        </div>
      </div>

      <div
        className="inline-flex h-5 min-w-5 items-center justify-center rounded-md px-1.5 text-[10px] font-bold"
        style={{
          color: "rgba(233, 239, 248, 0.95)",
          background: "rgba(141, 155, 174, 0.32)",
        }}
      >
        {slotNumber}
      </div>
    </div>
  );

  return (
    <div className="pointer-events-none z-20 h-full w-full">
      <div
        className={`flex h-full w-full flex-col rounded-none px-2.5 pb-2 pt-2.5 transition-all duration-300 ${
          hasLeftGame || isDefeated ? "opacity-85" : ""
        }`}
        style={{
          background: "transparent",
        }}
      >
        {timerEdge === "top" && (
          <div className="-mt-2.5 mb-2">{timerStrip}</div>
        )}

        {timerEdge === "top" && <div className="mb-2">{playerMeta}</div>}

        {timerEdge === "bottom" && (
          <div className="mt-auto">
            <div className="mb-2">{playerMeta}</div>
            <div className="-mb-2.5">{timerStrip}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayerCornerCard;
