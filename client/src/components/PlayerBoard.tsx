import { useState, type ReactNode } from "react";
import { FiCopy, FiClock, FiUserX, FiWifiOff } from "react-icons/fi";
import { useNavigate } from "react-router";
import useGameState from "../hooks/useBoard";
import { useSocket } from "../hooks/useSocket";
import { loadingSlots } from "../types/playerBoardTypes";
import { panelTheme } from "../utils/playerBoardThemes";

export function PlayerBoardSkeleton() {
  return (
    <div
      className="fixed top-4 right-4 w-[340px] max-w-[calc(100vw-2rem)] rounded-3xl border p-4 backdrop-blur-md"
      style={panelTheme}
    >
      <div className="animate-pulse space-y-3">
        <div className="h-10 rounded-2xl bg-slate-200" />
        <div className="h-10 rounded-2xl bg-slate-200" />
        <div className="h-24 rounded-2xl bg-slate-100" />
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

function PlayerBoard() {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [isForfeiting, setIsForfeiting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const {
    gameState: {
      players,
      gameStarted,
      gameOver,
      winner,
      isDraw,
      activePlayers,
      currentPlayer,
    },
    playerIndex,
  } = useGameState();

  const playerEntries = Array.from(players.entries());
  const connectedPlayers = playerEntries.filter(
    ([, player]) => player.isConnected,
  );
  const connectedPlayerIds = connectedPlayers.map(([playerId]) => playerId);
  const forfeitedPlayers = loadingSlots.filter((slot) =>
    Boolean(playerEntries[slot - 1]?.[1].leftGame),
  );
  const defeatedPlayers = loadingSlots.filter(
    (slot) => !(activePlayers ?? loadingSlots).includes(slot),
  );
  const isYouForfeited =
    playerIndex > 0 && forfeitedPlayers.includes(playerIndex);
  const isYouDefeated =
    playerIndex > 0 && defeatedPlayers.includes(playerIndex);
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

  return (
    <div
      className="fixed top-4 right-4 w-[340px] max-w-[calc(100vw-2rem)] rounded-3xl border p-4 backdrop-blur-md"
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

      {gameStarted && !gameOver && (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
          <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
            Turn
          </span>
          <div className="mt-1 text-base text-slate-800">
            Player {currentPlayer}
          </div>
        </div>
      )}

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
