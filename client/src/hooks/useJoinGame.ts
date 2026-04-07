import { useRef, useEffect, useState } from "react";
import { useSocket } from "./useSocket";
import type {
  GameState,
  BoardState,
  PlayerIndex,
  PlayerState,
  SerializedGameState,
  SerializedPlayerMap,
} from "../../../shared/types/gameTypes";
import { useNavigate } from "react-router";
import useGameState from "./useBoard";
import {
  getDefaultNicknameForPlayerId,
  getOrCreatePlayerId,
  resolveNickname,
} from "../utils/playerIdentity";

export function useJoinGame(roomId: string, nickname: string | null) {
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
    if (!socket || !nickname) {
      return;
    }

    const playerId = getOrCreatePlayerId();
    const resolvedNickname = resolveNickname(nickname, playerId);
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

    const isSerializedPlayerMap = (
      players: unknown,
    ): players is SerializedPlayerMap => {
      if (!Array.isArray(players)) {
        return false;
      }

      if (players.length === 0) {
        return true;
      }

      const first = players[0];
      return (
        Array.isArray(first) &&
        first.length === 2 &&
        typeof first[0] === "string" &&
        typeof first[1] === "object" &&
        first[1] !== null
      );
    };

    const hydratePlayersFromEvent = (
      players: SerializedPlayerMap | string[] | undefined,
      connectedPlayers: string[] | undefined,
    ): Map<string, PlayerState> | null => {
      if (!players) {
        return null;
      }

      if (isSerializedPlayerMap(players)) {
        return new Map(players);
      }

      return new Map<string, PlayerState>(
        players.map((nextPlayerId) => [
          nextPlayerId,
          {
            isConnected: (connectedPlayers ?? []).includes(nextPlayerId),
            leftGame:
              gameStateRef.current.players.get(nextPlayerId)?.leftGame ?? false,
            nickname:
              gameStateRef.current.players.get(nextPlayerId)?.nickname ??
              getDefaultNicknameForPlayerId(nextPlayerId),
          },
        ]),
      );
    };

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

    const handleRoomJoinDenied = (reason: string) => {
      setError(reason);
      alert(reason);
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
      turnsWithoutProgress,
      stallDrawFullRounds,
      players,
      connectedPlayers,
    }: {
      boardState: BoardState;
      currentPlayer: PlayerIndex;
      gameStarted?: boolean;
      gameOver?: boolean;
      winner?: PlayerIndex | null;
      isDraw?: boolean;
      activePlayers?: PlayerIndex[];
      turnsWithoutProgress?: number;
      stallDrawFullRounds?: number;
      players?: SerializedPlayerMap;
      connectedPlayers?: string[];
    }) => {
      if (!dispatch) {
        console.error("Dispatch is undefined/null");
        return;
      }

      try {
        const nextPlayers =
          hydratePlayersFromEvent(players, connectedPlayers) ??
          gameStateRef.current.players;

        dispatchNewGameState({
          ...gameStateRef.current,
          boardState,
          currentPlayer,
          players: nextPlayers,
          gameStarted: gameStarted ?? gameStateRef.current.gameStarted,
          gameOver: gameOver ?? gameStateRef.current.gameOver,
          winner: winner ?? gameStateRef.current.winner,
          isDraw: isDraw ?? gameStateRef.current.isDraw,
          activePlayers: activePlayers ?? gameStateRef.current.activePlayers,
          turnsWithoutProgress:
            turnsWithoutProgress ?? gameStateRef.current.turnsWithoutProgress,
          stallDrawFullRounds:
            stallDrawFullRounds ?? gameStateRef.current.stallDrawFullRounds,
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
      turnsWithoutProgress,
      stallDrawFullRounds,
      players,
      connectedPlayers,
    }: {
      boardState: BoardState;
      currentPlayer: PlayerIndex;
      gameStarted: boolean;
      gameOver: boolean;
      winner: PlayerIndex | null;
      isDraw: boolean;
      activePlayers: PlayerIndex[];
      turnsWithoutProgress?: number;
      stallDrawFullRounds?: number;
      players?: SerializedPlayerMap;
      connectedPlayers?: string[];
    }) => {
      const nextPlayers =
        hydratePlayersFromEvent(players, connectedPlayers) ??
        gameStateRef.current.players;

      dispatchNewGameState({
        ...gameStateRef.current,
        boardState,
        currentPlayer,
        players: nextPlayers,
        gameStarted,
        gameOver,
        winner,
        isDraw,
        activePlayers,
        turnsWithoutProgress:
          turnsWithoutProgress ?? gameStateRef.current.turnsWithoutProgress,
        stallDrawFullRounds:
          stallDrawFullRounds ?? gameStateRef.current.stallDrawFullRounds,
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

      const nextPlayers = data.gameState?.players
        ? hydratePlayersFromEvent(data.gameState.players, data.connectedPlayers)
        : hydratePlayersFromEvent(data.players, data.connectedPlayers);

      dispatchNewGameState({
        ...gameStateRef.current,
        ...nextBaseState,
        players: nextPlayers ?? gameStateRef.current.players,
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
      gameState?: SerializedGameState;
    }) => {
      syncPlayersFromEvent(data);
    };

    const handlePlayerForfeited = (data: {
      roomID: string;
      forfeitedPlayerId: string;
      forfeitedPlayerIndex: PlayerIndex;
      gameState: SerializedGameState;
    }) => {
      if (data.roomID !== roomId) {
        return;
      }

      dispatchNewGameState(hydrateGameState(data.gameState));
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
      players?: SerializedPlayerMap;
      connectedPlayers?: string[];
    }) => {
      if (data.roomID !== roomId) {
        return;
      }

      const nextPlayers =
        hydratePlayersFromEvent(data.players, data.connectedPlayers) ??
        gameStateRef.current.players;

      dispatchNewGameState({
        ...gameStateRef.current,
        boardState: data.boardState,
        currentPlayer: data.currentPlayer,
        players: nextPlayers,
        gameStarted: true,
      });
    };

    socket.on("room-joined", handleRoomJoined);
    socket.on("room-full", handleRoomFull);
    socket.on("room-not-found", handleRoomNotFound);
    socket.on("room-join-denied", handleRoomJoinDenied);
    socket.on("move-made", handleMoveMade);
    socket.on("player-joined", handlePlayerJoined);
    socket.on("player-disconnected", handlePlayerDisconnected);
    socket.on("player-reconnected", handlePlayerReconnected);
    socket.on("player-forfeited", handlePlayerForfeited);
    socket.on("game-started", handleGameStarted);
    socket.on("game-over", handleGameOver);

    // Register listeners before emitting join-room so the initial response
    // can't race ahead of subscriptions.
    socket.emit("join-room", roomId, playerId, resolvedNickname);

    // Cleanup listeners on unmount
    return () => {
      socket.off("room-joined", handleRoomJoined);
      socket.off("room-full", handleRoomFull);
      socket.off("room-not-found", handleRoomNotFound);
      socket.off("room-join-denied", handleRoomJoinDenied);
      socket.off("move-made", handleMoveMade);
      socket.off("player-joined", handlePlayerJoined);
      socket.off("player-disconnected", handlePlayerDisconnected);
      socket.off("player-reconnected", handlePlayerReconnected);
      socket.off("player-forfeited", handlePlayerForfeited);
      socket.off("game-started", handleGameStarted);
      socket.off("game-over", handleGameOver);
    };
  }, [socket, roomId, nickname, navigate, dispatch, setPlayerIndex]);

  return {
    initialStateFromServer: initialStateFromServerRef.current,
    playerIndex,
    isConnecting,
    error,
  };
}
