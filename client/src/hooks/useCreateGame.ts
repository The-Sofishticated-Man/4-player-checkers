import { useNavigate } from "react-router";
import { useSocket } from "./useSocket";
import initialBoard from "../utils/initialState";

export function useCreateGame() {
  const navigate = useNavigate();
  const { socket } = useSocket();

  const createGame = (afterCreate?: () => void) => {
    // Get or create persistent player ID
    let playerId = localStorage.getItem("playerId");
    if (!playerId) {
      playerId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem("playerId", playerId);
    }

    socket?.emit("create-room", initialBoard, playerId);

    socket?.on(
      "room-created",
      (data: { roomID: string; boardState: number[][]; playerId: string }) => {
        localStorage.setItem("playerId", data.playerId);
        localStorage.setItem("currentRoomId", data.roomID);
        navigate(`/game/${data.roomID}`);
        afterCreate?.();
      }
    );
  };

  return { createGame };
}
