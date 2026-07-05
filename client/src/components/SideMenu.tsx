import { useState } from "react";
import { FiUserX } from "react-icons/fi";
import { useNavigate } from "react-router";
import useGameState from "../hooks/useBoard";
import { useSocket } from "../hooks/useSocket";
import { loadingSlots } from "../types/sideMenuTypes";
import { getPlayerTheme, panelTheme } from "../utils/sideMenuThemes";
import RoomLinkField from "./RoomLinkField";
import ActionRow from "./ActionRow";
import StatusBanner from "./StatusBanner";
import ChatBox from "./ChatBox";

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
    },
    playerIndex,
  } = useGameState();

  const playerEntries = Array.from(players.entries());
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
      className="fixed right-[66px] top-1/2 z-40 flex w-[340px] max-w-[calc(100vw-2rem)] -translate-y-1/2 flex-col overflow-hidden rounded-2xl border font-mono"
      style={panelTheme}
    >
      <div
        className="flex items-center justify-between border-b px-4 py-4"
        style={{
          background: "var(--menu-header)",
          borderColor: "var(--menu-border)",
        }}
      >
        <h1
          className="mb-0 text-3xl font-normal tracking-tight leading-none"
          style={{ color: "var(--menu-heading)" }}
        >
          Room <br />
          <span className="font-light" style={{ color: "var(--menu-muted)" }}>
            #{roomId || "????"}
          </span>
        </h1>
        <div className="flex gap-1.5 self-start pt-2">
          {[1, 2, 3, 4].map((slot) => {
            const player = playerEntries[slot - 1]?.[1];
            const isConnected = Boolean(
              player?.isConnected && !player.leftGame,
            );
            const dotColor = isConnected
              ? getPlayerTheme(slot).pieceFill
              : "var(--menu-dot-muted)";
            return (
              <div
                key={slot}
                className="h-3 w-3 rounded-full border"
                style={{
                  backgroundColor: dotColor,
                  borderColor: isConnected
                    ? "rgba(255, 255, 255, 0.35)"
                    : "rgba(128, 140, 156, 0.22)",
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-0 p-4">
        {isYouForfeited && gameStarted && !gameOver && (
          <StatusBanner
            className="mb-3"
            icon={<FiUserX className="h-4 w-4" />}
            text="YOU FORFEITED THIS GAME"
          />
        )}

        {!isYouForfeited && isYouDefeated && gameStarted && !gameOver && (
          <StatusBanner className="mb-3" text="YOU ARE DEFEATED" />
        )}

        {gameOver && (
          <div
            className="mb-3 rounded px-4 py-3 text-center text-sm font-bold text-white shadow-lg border border-slate-500"
            style={{
              background: isDraw
                ? "var(--game-result-draw)"
                : "var(--game-result-win)",
            }}
          >
            {isDraw ? "DRAW" : `GAME OVER - PLAYER ${winner} WINS`}
          </div>
        )}

        <RoomLinkField
          roomLink={roomLink}
          linkCopied={linkCopied}
          onCopy={handleCopyGameLink}
        />

        {roomId && <ChatBox roomId={roomId} />}

        <div className="mt-0">
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
      </div>
    </div>
  );
}

export default SideMenu;
