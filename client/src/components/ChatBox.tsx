import { useEffect, useRef, useState, FormEvent } from "react";
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

  const messages = gameState.messages || [];

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
    <div className="flex flex-col border border-slate-700 bg-[#222] text-[#eee] font-mono text-sm shadow-md mt-4">
      <div className="border-b border-slate-700 px-3 py-2 text-[10px] uppercase tracking-widest text-[#aaa]">
        Chat
      </div>

      <div className="h-48 overflow-y-auto p-3 flex flex-col gap-3">
        {messages.map((msg, idx) => {
          const isMe = msg.playerId === myPlayerId;
          return (
            <div
              key={idx}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              <span
                className={`text-[10px] font-bold ${isMe ? "text-[#aaa]" : "text-white"}`}
              >
                {isMe ? "You" : msg.senderName}
              </span>
              <span
                className={`mt-0.5 max-w-[85%] text-xs ${isMe ? "text-[#ccc]" : "text-[#eee]"}`}
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
        className="flex items-center border-t border-slate-700 bg-[#2a2a2a] p-2 gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Say something..."
          className="flex-1 bg-transparent text-[#eee] outline-none text-xs placeholder:text-[#666]"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 border border-slate-600 rounded text-[#eee] hover:bg-[#333] transition-colors disabled:opacity-50"
        >
          <FiSend className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
}

export default ChatBox;
