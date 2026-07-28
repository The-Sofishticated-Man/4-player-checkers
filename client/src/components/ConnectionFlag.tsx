import React, { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

const ConnectionFlag: React.FC = () => {
  const { socket, isConnected } = useSocket();
  const [onlineCount, setOnlineCount] = useState<number | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handle = (count: number) => setOnlineCount(count);

    socket.on("online-count", handle);

    // Request current count from server if supported
    socket.emit("request-online-count");

    return () => {
      socket.off("online-count", handle);
    };
  }, [socket]);

  return (
    <div style={containerStyle} aria-live="polite">
      <span
        style={{ ...dotStyle, background: isConnected ? "#22c55e" : "#ef4444" }}
      />
      <span style={{ marginLeft: 8, fontSize: 13, color: "#0f172a" }}>
        {isConnected ? "Online" : "Offline"}
      </span>
      <span style={{ marginLeft: 8, fontSize: 12, color: "#475569" }}>
        {onlineCount !== null ? `· ${onlineCount} players` : ""}
      </span>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  position: "fixed",
  left: 12,
  bottom: 12,
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 10px",
  borderRadius: 8,
  background: "rgba(255,255,255,0.9)",
  boxShadow: "0 1px 3px rgba(2,6,23,0.08)",
  zIndex: 9999,
};

const dotStyle: React.CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: 999,
  display: "inline-block",
};

export default ConnectionFlag;
