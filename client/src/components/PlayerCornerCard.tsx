import { FiClock, FiUserX, FiUsers, FiWifiOff } from "react-icons/fi";
import type { PlayerSlot, PlayerTheme } from "../types/sideBoardTypes";

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
    : `Player ${slotNumber}`;

  const statusLabel = playerId
    ? hasLeftGame
      ? "Forfeited"
      : isDefeated
        ? "Defeated"
        : isConnected
          ? "Online"
          : "Disconnected"
    : "Waiting for player";

  const statusColor = hasLeftGame
    ? "var(--status-forfeited)"
    : isDisconnected
      ? "var(--status-disconnected)"
      : isDefeated
        ? "var(--status-defeated)"
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
      style={{ background: "var(--status-online)" }}
      aria-hidden="true"
    />
  );

  const baseRibbonColor = !playerId
    ? "var(--corner-ribbon-empty)"
    : isCurrentTurn
      ? `color-mix(in srgb, ${theme.accent} 74%, var(--ui-white) 26%)`
      : `color-mix(in srgb, ${theme.accent} 72%, var(--ui-black) 28%)`;

  const ribbonColor =
    hasLeftGame || isDefeated
      ? `color-mix(in srgb, ${baseRibbonColor} 62%, var(--corner-ribbon-muted) 38%)`
      : baseRibbonColor;

  const timerButtonColor = playerId
    ? isCurrentTurn
      ? theme.pieceFill
      : `color-mix(in srgb, ${theme.pieceFill} 84%, var(--ui-black) 16%)`
    : "var(--corner-timer-empty)";

  const timerStrip = (
    <div
      className="-mx-2.5 flex items-center justify-between gap-2 rounded-none px-2 py-1.5"
      style={{
        background: ribbonColor,
      }}
    >
      <div
        className="inline-flex h-8 w-8 items-center justify-center rounded-md"
        style={{
          background: timerButtonColor,
          color: "var(--app-on-dark-muted)",
        }}
      >
        <FiClock className="h-5 w-5" />
      </div>

      <div className="min-w-0 text-right">
        <span
          className="block text-[1.62rem] font-extrabold leading-none tabular-nums tracking-[-0.04em]"
          style={{ color: "var(--app-on-dark)" }}
        >
          {clockLabel}
        </span>
      </div>
    </div>
  );

  const showStatus = Boolean(statusLabel);

  const slotBadgeBackground = playerId
    ? theme.accent
    : "var(--corner-slot-empty)";
  const slotBadgeBorderColor = playerId
    ? theme.border
    : "var(--corner-slot-empty-border)";
  const slotBadgeTextColor = "var(--app-on-dark)";

  const playerMeta = (
    <div className="-mx-2.5 flex items-start gap-2">
      <div
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-[13px] font-extrabold leading-none tabular-nums"
        style={{
          color: slotBadgeTextColor,
          background: slotBadgeBackground,
          borderColor: slotBadgeBorderColor,
        }}
      >
        {slotNumber}
      </div>

      <div className="min-w-0 flex-1 pl-2">
        <div
          className="truncate text-[15px] font-bold tracking-tight"
          style={{ color: "var(--app-ink)" }}
        >
          {!playerId ? (
            <span className="animate-pulse">{displayName}</span>
          ) : (
            displayName
          )}
          {isYou && playerId ? " (You)" : ""}
        </div>
        {showStatus && (
          <div
            className="mt-0.5 inline-flex min-w-0 items-center gap-1.5 truncate text-[11px] font-semibold"
            style={{ color: statusColor }}
          >
            {statusIcon}
            <span className="truncate">{statusLabel}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="pointer-events-none z-20 h-full w-full p-1.5">
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
