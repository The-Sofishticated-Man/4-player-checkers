import { useContext } from "react";
import { SocketContext } from "../context/SocketProvider";

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return {
    socket: context.socket,
    roomID: context.socket?.id || null,
    isConnected: context.isConnected,
  };
};
