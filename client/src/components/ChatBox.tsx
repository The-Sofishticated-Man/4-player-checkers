import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import useGameState from "../hooks/useBoard";
import { useSocket } from "../hooks/useSocket";
import { FiSend } from "react-icons/fi";
import { getOrCreatePlayerId } from "../utils/playerIdentity";

function ChatBox({ roomId }: { roomId: string }) {
  const { gameState } = useGameState();
  const { socket } = useSocket();
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const myPlayerId = getOrCreatePlayerId();

  const messages = useMemo(
    () => gameState.messages || [],
    [gameState.messages],
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socket || !roomId) return;

    socket.emit("send-message", roomId, inputText.trim());
    setInputText("");
  };

  return (
    <div
      className="mt-4 flex flex-col border font-mono text-sm shadow-md"
      style={{
        background: "var(--menu-surface-strong)",
        borderColor: "var(--menu-border)",
        color: "var(--menu-heading)",
      }}
    >
      <div
        className="border-b px-3 py-2 text-[10px] uppercase tracking-widest"
        style={{
          borderColor: "var(--menu-border)",
          color: "var(--menu-muted)",
        }}
      >
        Chat
      </div>

      <div className="h-48 overflow-y-auto p-3 flex flex-col gap-3">
        {messages.map((msg, idx) => {
          const isSystemMessage = msg.kind === "system";
          const isMe = msg.playerId === myPlayerId;

          if (isSystemMessage) {
            return (
              <div key={idx} className="flex justify-center px-2 text-center">
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
              key={idx}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              <span
                className="text-[10px] font-bold"
                style={{
                  color: isMe ? "var(--menu-muted)" : "var(--menu-heading)",
                }}
              >
                {isMe ? "You" : msg.senderName}
              </span>
              <span
                className="mt-0.5 max-w-[85%] text-xs"
                style={{
                  color: isMe ? "var(--menu-text)" : "var(--menu-heading)",
                }}
              >
                {msg.text}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2 border-t p-2"
        style={{
          borderColor: "var(--menu-border)",
          background: "var(--menu-header)",
        }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Say something..."
          className="flex-1 bg-transparent text-xs outline-none placeholder:opacity-60"
          style={{ color: "var(--menu-heading)" }}
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="rounded border p-2 transition-colors disabled:opacity-50"
          style={{
            borderColor: "var(--menu-border)",
            color: "var(--menu-heading)",
          }}
        >
          <FiSend className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
}

export default ChatBox;
