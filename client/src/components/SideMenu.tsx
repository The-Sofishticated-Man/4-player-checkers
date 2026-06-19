import { useState } from "react";
import { FiClock, FiUserX, FiWifiOff } from "react-icons/fi";
import { useNavigate } from "react-router";
import useGameState from "../hooks/useBoard";
import { useSocket } from "../hooks/useSocket";
import { loadingSlots } from "../types/sideMenuTypes";
import { panelTheme } from "../utils/sideMenuThemes";
import RoomLinkField from "./RoomLinkField";
import ActionRow from "./ActionRow";
import StatusBanner from "./StatusBanner";

function SideMenu() {
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
              ? "var(--game-result-draw)"
              : "var(--game-result-win)",
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

export default SideMenu;
