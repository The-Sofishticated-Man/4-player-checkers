import { useNavigate } from "react-router";
import { useSocket } from "./useSocket";
import initialState from "../utils/initialState";

export function useCreateGame() {
  const navigate = useNavigate();
  const { socket } = useSocket();

  const createGame = (afterCreate?: () => void) => {
    // Get or create persistent player ID
    socket?.emit("create-room", initialState.checkersBoardState);

    socket?.on("room-created", ({ roomID }: { roomID: string }) => {
      // todo: implement some way of letting player join multiple games
      navigate(`/game/${roomID}`);
      afterCreate?.();
    });
  };

  return { createGame };
}
