import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiCopy,
  FiCheck,
  FiSend,
  FiLogOut,
  FiMessageCircle,
  FiUserX,
} from "react-icons/fi";
import { useNavigate } from "react-router";
import useGameState from "../hooks/useBoard";
import { useSocket } from "../hooks/useSocket";
import { loadingSlots } from "../types/sideMenuTypes";
import { getOrCreatePlayerId } from "../utils/playerIdentity";

// Shared player colors for the side menu dots and status accents.
const PLAYER_COLORS: Record<number, string> = {
  1: "var(--player-1-color)",
  2: "var(--player-2-color)",
  3: "var(--player-3-color)",
  4: "var(--player-4-color)",
};

function SideMenu() {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [isForfeiting, setIsForfeiting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    gameState: {
      players,
      gameStarted,
      gameOver,
      winner,
      isDraw,
      activePlayers,
      messages,
    },
    playerIndex,
  } = useGameState();
  const myPlayerId = getOrCreatePlayerId();

  const chatMessages = useMemo(() => messages || [], [messages]);

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
  const roomMode = sessionStorage.getItem("currentGameMode");
  const isQuickPlay = roomMode === "quickplay";
  const roomLink =
    !isQuickPlay && roomId
      ? new URL(`/game/4-player-checkers${roomId}`, window.location.origin).toString()
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
    if (!roomLink) return;

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
    if (!confirmed) return;

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
        sessionStorage.removeItem("currentGameMode");
        navigate("/");
      },
    );
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !socket || !roomId) return;

    socket.emit(
      "send-message",
      roomId,
      chatMessage.trim(),
      (response?: { ok: boolean; message?: string }) => {
        if (!response?.ok) {
          alert(response?.message ?? "Unable to send message right now.");
          return;
        }

        setChatMessage("");
      },
    );
  };

  return (
    <div
      className="fixed right-[66px] top-1/2 z-40 flex h-[min(860px,calc(100vh-2rem))] w-[340px] max-w-[calc(100vw-2rem)] -translate-y-1/2 flex-col rounded-2xl border font-sans"
      style={{
        background: "var(--menu-panel-bg)",
        borderColor: "var(--menu-panel-border)",
        boxShadow: "var(--menu-panel-shadow)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-4">
        <h1
          className="text-2xl font-bold leading-tight tracking-tight"
          style={{ color: "var(--menu-heading)" }}
        >
          Room
          <br />
          <span
            className="text-2xl font-semibold"
            style={{ color: "var(--menu-code)" }}
          >
            #{roomId || "????"}
          </span>
        </h1>
        <div className="flex gap-2 pt-1.5">
          {[1, 2, 3, 4].map((slot) => {
            const player = playerEntries[slot - 1]?.[1];
            const isConnected = Boolean(
              player?.isConnected && !player.leftGame,
            );
            return (
              <div
                key={slot}
                className="h-3.5 w-3.5 rounded-full border"
                style={{
                  backgroundColor: isConnected
                    ? PLAYER_COLORS[slot]
                    : "var(--menu-dot-muted)",
                  borderColor: "var(--menu-dot-ring)",
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-5">
        {/* Status banners */}
        {isYouForfeited && gameStarted && !gameOver && (
          <div
            className="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold"
            style={{
              background: "var(--menu-banner-warn-bg)",
              borderColor: "var(--menu-banner-warn-border)",
              color: "var(--menu-banner-warn-text)",
            }}
          >
            <FiUserX className="h-4 w-4 shrink-0" />
            YOU FORFEITED THIS GAME
          </div>
        )}

        {!isYouForfeited && isYouDefeated && gameStarted && !gameOver && (
          <div
            className="rounded-lg border px-3 py-2.5 text-center text-sm font-semibold"
            style={{
              background: "var(--menu-banner-defeat-bg)",
              borderColor: "var(--menu-banner-defeat-border)",
              color: "var(--menu-banner-defeat-text)",
            }}
          >
            YOU ARE DEFEATED
          </div>
        )}

        {gameOver && (
          <div
            className="rounded-lg px-4 py-3 text-center text-sm font-bold text-white"
            style={{
              background: isDraw
                ? "var(--game-result-draw)"
                : "var(--game-result-win)",
            }}
          >
            {isDraw ? "DRAW" : `GAME OVER - PLAYER ${winner} WINS`}
          </div>
        )}

        {!isQuickPlay ? (
          <div>
            <p
              className="mb-2 text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--menu-label)" }}
            >
              Invite link
            </p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={roomLink}
                placeholder="Waiting for room…"
                className="min-w-0 flex-1 truncate rounded-lg border px-3 py-2.5 text-sm outline-none"
                style={{
                  background: "var(--menu-input-bg)",
                  borderColor: "var(--menu-input-border)",
                  color: "var(--menu-input-text)",
                }}
              />
              <button
                type="button"
                onClick={handleCopyGameLink}
                disabled={!roomLink}
                aria-label="Copy invite link"
                className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: "var(--menu-copy-btn-bg)",
                  color: "var(--menu-copy-btn-text)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "var(--menu-copy-btn-bg-hover)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "var(--menu-copy-btn-bg)";
                }}
              >
                {linkCopied ? (
                  <FiCheck className="h-4 w-4" />
                ) : (
                  <FiCopy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        ) : null}

        {/* Chat */}
        <div className="flex min-h-0 flex-1 flex-col">
          <p
            className="mb-2 text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--menu-label)" }}
          >
            Chat
          </p>

          <div
            className="mb-2 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto rounded-lg border px-4 py-4"
            style={{
              background: "var(--menu-chat-bg)",
              borderColor: "var(--menu-chat-border)",
            }}
          >
            {chatMessages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-1 text-center">
                <FiMessageCircle
                  className="mb-1 h-7 w-7"
                  style={{ color: "var(--menu-chat-icon)" }}
                />
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--menu-chat-empty-title)" }}
                >
                  No messages yet.
                </p>
                <p
                  className="text-sm"
                  style={{ color: "var(--menu-chat-empty-subtitle)" }}
                >
                  Say hi to your friends!
                </p>
              </div>
            ) : (
              chatMessages.map((msg, idx) => {
                const isSystemMessage = msg.kind === "system";
                const isMe = msg.playerId === myPlayerId;

                if (isSystemMessage) {
                  return (
                    <div
                      key={`${msg.timestamp}-${idx}`}
                      className="flex justify-center px-2 text-center"
                    >
                      <span
                        className="max-w-[90%] text-[11px] italic"
                        style={{ color: "var(--menu-muted)" }}
                      >
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={`${msg.timestamp}-${idx}`}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <span
                      className="text-[10px] font-bold"
                      style={{
                        color: isMe
                          ? "var(--menu-muted)"
                          : "var(--menu-heading)",
                      }}
                    >
                      {isMe ? "You" : msg.senderName}
                    </span>
                    <span
                      className="mt-0.5 max-w-[85%] text-xs"
                      style={{
                        color: isMe
                          ? "var(--menu-text)"
                          : "var(--menu-heading)",
                      }}
                    >
                      {msg.text}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-center gap-2">
            <input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Say something…"
              className="min-w-0 flex-1 rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{
                background: "var(--menu-input-bg)",
                borderColor: "var(--menu-input-border)",
                color: "var(--menu-input-text)",
              }}
            />
            <button
              type="button"
              onClick={handleSendMessage}
              aria-label="Send message"
              className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg transition-colors"
              style={{
                background: "var(--menu-send-btn-bg)",
                color: "var(--menu-copy-btn-text)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "var(--menu-send-btn-bg-hover)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "var(--menu-send-btn-bg)";
              }}
            >
              <FiSend className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Leave / forfeit */}
        <button
          type="button"
          onClick={handleForfeitGame}
          disabled={isForfeiting || isYouForfeited || playerIndex <= 0}
          className="flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            background: "var(--menu-leave-bg)",
            borderColor: "var(--menu-leave-border)",
            color: "var(--menu-leave-text)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "var(--menu-leave-bg-hover)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "var(--menu-leave-bg)";
          }}
        >
          <FiLogOut className="h-4 w-4" />
          {isForfeiting ? "LEAVING…" : "LEAVE GAME"}
        </button>
      </div>
    </div>
  );
}

export default SideMenu;
