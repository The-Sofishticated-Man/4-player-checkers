import { useRef, useEffect, useState } from "react";
import { useSocket } from "./useSocket";
import type {
  checkersBoardState,
  currentPlayerState,
  gameState,
} from "../../../shared/types/boardTypes";
import { useNavigate } from "react-router";
import useBoard from "./useBoard";
import { printBoard } from "../utils/debugUtils";

export function useJoinGame(roomId: string) {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const initialStateFromServerRef = useRef<gameState | null>(null);
  const playerIndex = useRef<number>(0);
  const { dispatch, setPlayerIndex } = useBoard();
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug logging for useBoard hook
  console.log("🔍 useBoard dispatch:", dispatch);
  console.log("🔍 useBoard dispatch type:", typeof dispatch);
  console.log("🔍 useBoard dispatch is undefined?", dispatch === undefined);

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
      console.log("🚀 Move made received!");
      console.log("📊 Data received:", { newBoardState, nextPlayer });
      console.log("🔧 Dispatch function:", dispatch);
      console.log("🔧 Dispatch type:", typeof dispatch);
      console.log("🔧 Dispatch is function?", typeof dispatch === "function");

      if (!dispatch) {
        console.error("❌ Dispatch is undefined/null!");
        return;
      }

      console.log("📤 About to dispatch UPDATE_GAME_STATE...");

      try {
        const result = dispatch({
          type: "UPDATE_GAME_STATE",
          payload: {
            newState: {
              checkersBoardState: newBoardState,
              currentPlayer: nextPlayer,
            },
          },
        });

        console.log("✅ Dispatch result:", result);
        console.log("✅ Dispatch completed successfully");
      } catch (error) {
        console.error("❌ Dispatch failed with error:", error);
      }
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
