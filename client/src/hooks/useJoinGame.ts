import { useRef, useEffect, useState } from "react";
import { useSocket } from "./useSocket";
import type {
  checkersBoardState,
  currentPlayerState,
  gameState,
} from "../../../shared/types/boardTypes";
import { useNavigate } from "react-router";
import useBoard from "./useBoard";

export function useJoinGame(roomId: string) {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const initialStateFromServerRef = useRef<gameState | null>(null);
  const { dispatch } = useBoard();
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) {
      console.log("Waiting for socket connection...");
      return;
    }

    // Get or create persistent player ID
    let playerId = localStorage.getItem("playerId");
    if (!playerId) {
      console.log("Creating new player ID");
      playerId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem("playerId", playerId);
    } else {
      console.log(
        "found playerID in localStorage, using it for joining room: ",
        playerId
      );
    }

    console.log(
      `Socket connected, joining room: ${roomId} as player: ${playerId}`
    );
    socket.emit("join-room", roomId, playerId);
    setIsConnecting(true);

    // Listen for success response
    const handleRoomJoined = (data: {
      roomID: string;
      boardState: checkersBoardState;
      currentPlayer: currentPlayerState;
      playerId: string;
    }) => {
      console.log(`Joined room: ${data.roomID}`);
      sessionStorage.setItem("currentRoomId", data.roomID);
      initialStateFromServerRef.current = {
        checkersBoardState: data.boardState,
        currentPlayer: data.currentPlayer,
      };
      setIsConnecting(false);
      setError(null);
    };

    // Listen for error responses
    const handleRoomFull = (roomID: string) => {
      console.error(`Room ${roomID} is full`);
      setError("Room is full (4 players max)");
      alert("Room is full");
      navigate("/");
      setIsConnecting(false);
    };

    const handleRoomNotFound = (roomID: string) => {
      console.error(`Room ${roomID} not found`);
      setError("Room not found");
      alert("Room not found");
      navigate("/");
      setIsConnecting(false);
    };
    const handleMoveMade = ({
      newBoardState,
      nextPlayer,
    }: {
      newBoardState: checkersBoardState;
      nextPlayer: currentPlayerState;
    }) => {
      console.log("Move made received:");
      // Update the entire game state
      dispatch({
        type: "UPDATE_GAME_STATE",
        payload: {
          newState: {
            checkersBoardState: newBoardState,
            currentPlayer: nextPlayer,
          },
        },
      });
    };

    socket.on("room-joined", handleRoomJoined);
    socket.on("room-full", handleRoomFull);
    socket.on("room-not-found", handleRoomNotFound);
    socket.on("move-made", handleMoveMade);

    // Cleanup listeners on unmount
    return () => {
      socket.off("room-joined", handleRoomJoined);
      socket.off("room-full", handleRoomFull);
      socket.off("room-not-found", handleRoomNotFound);
      socket.off("move-made", handleMoveMade);
    };
  }, [socket, roomId, navigate, dispatch]);

  return {
    initialStateFromServer: initialStateFromServerRef.current,

    isConnecting,
    error,
  };
}
