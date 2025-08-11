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
      playerIndex: number;
    }) => {
      console.log(`Joined room: ${data.roomID}`);
      sessionStorage.setItem("currentRoomId", data.roomID);
      playerIndex.current = data.playerIndex; // Store player index
      console.log("Player index:", playerIndex.current);

      // Update the player index in the context
      setPlayerIndex(data.playerIndex);

      initialStateFromServerRef.current = {
        checkersBoardState: data.boardState,
        currentPlayer: data.currentPlayer,
        gameStarted: false, // Game starts as not started when joining
      };

      // Dispatch the initial state to the context
      if (dispatch) {
        console.log("📤 Dispatching initial game state from room-joined...");
        dispatch({
          type: "UPDATE_GAME_STATE",
          payload: {
            newState: {
              checkersBoardState: data.boardState,
              currentPlayer: data.currentPlayer,
              gameStarted: false, // Game starts as not started when joining
            },
          },
        });
      }

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
      boardState,
      currentPlayer,
      gameStarted,
    }: {
      boardState: checkersBoardState;
      currentPlayer: currentPlayerState;
      gameStarted?: boolean;
    }) => {
      console.log("🚀 Move made received!");
      console.log("📊 Data received:", {
        boardState,
        currentPlayer,
        gameStarted,
      });
      printBoard(boardState);
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
              checkersBoardState: boardState,
              currentPlayer: currentPlayer,
              gameStarted: gameStarted,
            },
          },
        });

        console.log("✅ Dispatch result:", result);
        console.log("✅ Dispatch completed successfully");
      } catch (error) {
        console.error("❌ Dispatch failed with error:", error);
      }
    };

    // Listen for game started event
    const handleGameStarted = () => {
      console.log("🎮 Game started! All 4 players are connected.");
      if (dispatch) {
        dispatch({
          type: "UPDATE_GAME_STATE",
          payload: {
            newState: {
              ...initialStateFromServerRef.current!,
              gameStarted: true,
            },
          },
        });
      }
    };

    socket.on("room-joined", handleRoomJoined);
    socket.on("room-full", handleRoomFull);
    socket.on("room-not-found", handleRoomNotFound);
    socket.on("move-made", handleMoveMade);
    socket.on("game-started", handleGameStarted);

    // Cleanup listeners on unmount
    return () => {
      socket.off("room-joined", handleRoomJoined);
      socket.off("room-full", handleRoomFull);
      socket.off("room-not-found", handleRoomNotFound);
      socket.off("move-made", handleMoveMade);
      socket.off("game-started", handleGameStarted);
    };
  }, [socket, roomId, navigate, dispatch, setPlayerIndex]);

  return {
    initialStateFromServer: initialStateFromServerRef.current,
    playerIndex: playerIndex.current,
    isConnecting,
    error,
  };
}
