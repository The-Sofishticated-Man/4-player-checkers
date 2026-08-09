import { useNavigate } from "react-router";
import { useSocket } from "./useSocket";
import initialState from "../../../server/src/utils/initialGameState";
import {
  getOrCreatePlayerId,
  getStoredNickname,
  resolveNickname,
} from "../utils/playerIdentity";

type RoomMode = "private" | "quickplay";

export function useCreateGame() {
  const navigate = useNavigate();
  const { socket } = useSocket();

  const startGame = (roomMode: RoomMode, afterCreate?: () => void) => {
    if (!socket) {
      return;
    }

    const playerId = getOrCreatePlayerId();
    const nickname = resolveNickname(getStoredNickname(), playerId);

    socket.once(
      "room-created",
      ({
        roomID,
        roomMode: createdRoomMode,
      }: {
        roomID: string;
        roomMode?: RoomMode;
      }) => {
        sessionStorage.setItem("currentRoomId", roomID);
        sessionStorage.setItem("currentGameMode", createdRoomMode ?? roomMode);
        navigate(`/game/${roomID}`);
        afterCreate?.();
      },
    );

    socket.emit("create-room", {
      boardState: initialState.boardState,
      roomMode,
      playerId: roomMode === "quickplay" ? playerId : undefined,
      nickname: roomMode === "quickplay" ? nickname : undefined,
    });
  };

  return {
    createGame: (afterCreate?: () => void) => startGame("private", afterCreate),
    quickPlay: (afterCreate?: () => void) =>
      startGame("quickplay", afterCreate),
  };
}
