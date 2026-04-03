import { useRef, useEffect, useState } from "react";
import { useSocket } from "./useSocket";
import type {
  GameState,
  BoardState,
  PlayerIndex,
  PlayerState,
} from "../../../shared/types/gameTypes";
import { useNavigate } from "react-router";
import useGameState from "./useBoard";

type SerializedGameState = Omit<GameState, "players"> & {
  players: [string, PlayerState][];
};

export function useJoinGame(roomId: string) {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const initialStateFromServerRef = useRef<GameState | null>(null);
  const {
    gameState,
    dispatchGameState: dispatch,
    playerIndex,
    setPlayerIndex,
  } = useGameState();
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keep latest game state available to socket event handlers without
  // re-running the join effect on every reducer update.
  const gameStateRef = useRef(gameState);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    // Get or create persistent player ID
    let playerId = localStorage.getItem("playerId");
    if (!playerId) {
      playerId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem("playerId", playerId);
    }
    setIsConnecting(true);

    const dispatchNewGameState = (newGameState: GameState) => {
      if (!dispatch) {
        return;
      }

      dispatch({
        type: "UPDATE_GAME_STATE",
        payload: {
          newGameState,
        },
      });
    };

    const hydrateGameState = (serialized: SerializedGameState): GameState => ({
      ...serialized,
      players: new Map(serialized.players),
    });

    // Listen for success response
    const handleRoomJoined = (data: {
      roomID: string;
      gameState: SerializedGameState;
      playerIndex: PlayerIndex;
    }) => {
      sessionStorage.setItem("currentRoomId", data.roomID);
      setPlayerIndex(data.playerIndex);

      const hydratedGameState = hydrateGameState(data.gameState);

      initialStateFromServerRef.current = hydratedGameState;

      // Dispatch the initial state to the context
      dispatchNewGameState(hydratedGameState);

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
      gameOver,
      winner,
      isDraw,
      activePlayers,
    }: {
      boardState: BoardState;
      currentPlayer: PlayerIndex;
      gameStarted?: boolean;
      gameOver?: boolean;
      winner?: PlayerIndex | null;
      isDraw?: boolean;
      activePlayers?: PlayerIndex[];
    }) => {
      if (!dispatch) {
        console.error("Dispatch is undefined/null");
        return;
      }

      try {
        dispatchNewGameState({
          ...gameStateRef.current,
          boardState,
          currentPlayer,
          gameStarted: gameStarted ?? gameStateRef.current.gameStarted,
          gameOver: gameOver ?? gameStateRef.current.gameOver,
          winner: winner ?? gameStateRef.current.winner,
          isDraw: isDraw ?? gameStateRef.current.isDraw,
          activePlayers: activePlayers ?? gameStateRef.current.activePlayers,
        });
      } catch (error) {
        console.error("Dispatch failed with error:", error);
      }
    };

    const handleGameOver = ({
      boardState,
      currentPlayer,
      gameStarted,
      gameOver,
      winner,
      isDraw,
      activePlayers,
    }: {
      boardState: BoardState;
      currentPlayer: PlayerIndex;
      gameStarted: boolean;
      gameOver: boolean;
      winner: PlayerIndex | null;
      isDraw: boolean;
      activePlayers: PlayerIndex[];
    }) => {
      dispatchNewGameState({
        ...gameStateRef.current,
        boardState,
        currentPlayer,
        gameStarted,
        gameOver,
        winner,
        isDraw,
        activePlayers,
      });
    };

    const syncPlayersFromEvent = (data: {
      gameState?: SerializedGameState;
      players?: string[];
      connectedPlayers?: string[];
      gameStarted?: boolean;
    }) => {
      const nextBaseState = data.gameState
        ? hydrateGameState(data.gameState)
        : gameStateRef.current;

      const nextPlayers = data.gameState
        ? nextBaseState.players
        : new Map<string, PlayerState>(
            (data.players ?? []).map((nextPlayerId) => [
              nextPlayerId,
              {
                isConnected: (data.connectedPlayers ?? []).includes(
                  nextPlayerId,
                ),
                leftGame: false,
              },
            ]),
          );

      dispatchNewGameState({
        ...gameStateRef.current,
        ...nextBaseState,
        players: nextPlayers,
        gameStarted:
          data.gameStarted ??
          nextBaseState.gameStarted ??
          gameStateRef.current.gameStarted,
      });
    };

    const handlePlayerJoined = (data: {
      roomID: string;
      gameState: SerializedGameState;
      players: string[];
      connectedPlayers: string[];
      gameStarted: boolean;
    }) => {
      if (data.roomID !== roomId) {
        return;
      }

      syncPlayersFromEvent(data);
    };

    const handlePlayerDisconnected = (data: {
      players: string[];
      connectedPlayers: string[];
    }) => {
      syncPlayersFromEvent(data);
    };

    const handlePlayerReconnected = (data: {
      roomID: string;
      gameState: SerializedGameState;
      players: string[];
      connectedPlayers: string[];
      gameStarted: boolean;
    }) => {
      if (data.roomID !== roomId) {
        return;
      }

      syncPlayersFromEvent(data);
    };

    // Listen for game started event
    const handleGameStarted = (data: {
      roomID: string;
      boardState: BoardState;
      currentPlayer: PlayerIndex;
    }) => {
      if (data.roomID !== roomId) {
        return;
      }

      dispatchNewGameState({
        ...gameStateRef.current,
        boardState: data.boardState,
        currentPlayer: data.currentPlayer,
        gameStarted: true,
      });
    };

    socket.on("room-joined", handleRoomJoined);
    socket.on("room-full", handleRoomFull);
    socket.on("room-not-found", handleRoomNotFound);
    socket.on("move-made", handleMoveMade);
    socket.on("player-joined", handlePlayerJoined);
    socket.on("player-disconnected", handlePlayerDisconnected);
    socket.on("player-reconnected", handlePlayerReconnected);
    socket.on("game-started", handleGameStarted);
    socket.on("game-over", handleGameOver);

    // Register listeners before emitting join-room so the initial response
    // can't race ahead of subscriptions.
    socket.emit("join-room", roomId, playerId);

    // Cleanup listeners on unmount
    return () => {
      socket.off("room-joined", handleRoomJoined);
      socket.off("room-full", handleRoomFull);
      socket.off("room-not-found", handleRoomNotFound);
      socket.off("move-made", handleMoveMade);
      socket.off("player-joined", handlePlayerJoined);
      socket.off("player-disconnected", handlePlayerDisconnected);
      socket.off("player-reconnected", handlePlayerReconnected);
      socket.off("game-started", handleGameStarted);
      socket.off("game-over", handleGameOver);
    };
  }, [socket, roomId, navigate, dispatch, setPlayerIndex]);

  return {
    initialStateFromServer: initialStateFromServerRef.current,
    playerIndex,
    isConnecting,
    error,
  };
}
