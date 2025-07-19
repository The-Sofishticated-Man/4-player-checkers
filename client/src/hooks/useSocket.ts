import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface UseSocketReturn {
  socket: Socket | null;
  roomID: string | null;
  isConnected: boolean;
}

export const useSocket = (
  serverURL: string = "http://localhost:3000"
): UseSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Create socket connection
    socketRef.current = io(serverURL);

    socketRef.current.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to server!");
    });

    socketRef.current.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from server");
    });

    // Cleanup on unmount
    return () => {
      socketRef.current?.disconnect();
    };
  }, [serverURL]);

  return {
    socket: socketRef.current,
    roomID: socketRef.current?.id || null,
    isConnected,
  };
};
