import { useEffect, useState } from "react";
import useBoard from "../hooks/useBoard";
import { useSocket } from "../hooks/useSocket";

interface GameInfo {
  players: string[]; // All players who joined the game (permanent)
  connectedPlayers: string[]; // Currently connected players
  playerId: string;
  gameStarted: boolean;
}

function PlayerBoard() {
  const {
    state: { currentPlayer },
    playerIndex,
  } = useBoard();
  const { socket } = useSocket();
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);

  // Get the current room ID from session storage
  const roomId = sessionStorage.getItem("currentRoomId");

  useEffect(() => {
    if (!socket || !roomId) return;

    // Listen for new player joins (when player-joined is broadcast to others)
    const handlePlayerJoined = (data: {
      roomID: string;
      boardState: number[][];
      currentPlayer: number;
      playerId: string;
      playerIndex: number;
      gameStarted: boolean;
      players: string[];
      connectedPlayers: string[];
    }) => {
      console.log(`New player joined: ${data.playerId}`);
      setGameInfo({
        players: data.players,
        connectedPlayers: data.connectedPlayers,
        playerId: data.playerId,
        gameStarted: data.gameStarted,
      });
    };

    // Listen for game state response
    const handleGameState = (data: {
      players: string[];
      connectedPlayers: string[];
      playerId: string;
      gameStarted: boolean;
      currentPlayer: number;
      roomID: string;
    }) => {
      setGameInfo({
        players: data.players,
        connectedPlayers: data.connectedPlayers,
        playerId: data.playerId,
        gameStarted: data.gameStarted,
      });
    };

    // Listen for player disconnection
    const handlePlayerDisconnected = (data: {
      playerId: string;
      players: string[];
      connectedPlayers: string[];
    }) => {
      console.log(`Player disconnected: ${data.playerId}`);
      setGameInfo((prevInfo) => {
        if (!prevInfo) return null;
        return {
          ...prevInfo,
          players: data.players,
          connectedPlayers: data.connectedPlayers,
        };
      });
    };

    // Listen for player reconnections
    const handlePlayerReconnected = (data: {
      roomID: string;
      boardState: number[][];
      currentPlayer: number;
      playerId: string;
      playerIndex: number;
      gameStarted: boolean;
      players: string[];
      connectedPlayers: string[];
    }) => {
      console.log(`Player reconnected: ${data.playerId}`);
      setGameInfo({
        players: data.players,
        connectedPlayers: data.connectedPlayers,
        playerId: data.playerId,
        gameStarted: data.gameStarted,
      });
    };

    // Listen for game start event
    const handleGameStarted = (data: {
      roomID: string;
      playerIndex: number;
    }) => {
      console.log(`🎮 Game started in room: ${data.roomID}!`);
      setGameInfo((prevInfo) => {
        if (!prevInfo) return null;
        return {
          ...prevInfo,
          gameStarted: true,
        };
      });
    };

    socket.on("player-disconnected", handlePlayerDisconnected);
    socket.on("player-joined", handlePlayerJoined);
    socket.on("player-reconnected", handlePlayerReconnected);
    socket.on("game-started", handleGameStarted);
    socket.on("game-state", handleGameState);

    // Request current game state when component mounts
    socket.emit("get-game-state", roomId);

    return () => {
      socket.off("player-disconnected", handlePlayerDisconnected);
      socket.off("player-joined", handlePlayerJoined);
      socket.off("player-reconnected", handlePlayerReconnected);
      socket.off("game-started", handleGameStarted);
      socket.off("game-state", handleGameState);
    };
  }, [socket, roomId]);

  // Player colors for display
  const getPlayerColor = (playerNum: number) => {
    switch (playerNum) {
      case 1:
        return {
          bg: "bg-red-500",
          text: "text-red-500",
          border: "border-red-500",
          name: "Red",
        };
      case 2:
        return {
          bg: "bg-blue-500",
          text: "text-blue-500",
          border: "border-blue-500",
          name: "Blue",
        };
      case 3:
        return {
          bg: "bg-green-500",
          text: "text-green-500",
          border: "border-green-500",
          name: "Green",
        };
      case 4:
        return {
          bg: "bg-yellow-500",
          text: "text-yellow-500",
          border: "border-yellow-500",
          name: "Yellow",
        };
      default:
        return {
          bg: "bg-gray-500",
          text: "text-gray-500",
          border: "border-gray-500",
          name: "Unknown",
        };
    }
  };

  // Generate display for each player slot
  const renderPlayerSlot = (slotNumber: number) => {
    const playerColor = getPlayerColor(slotNumber);
    const isCurrentTurn = currentPlayer === slotNumber;
    const isYou = playerIndex === slotNumber;
    const playerId = gameInfo && gameInfo.players[slotNumber - 1];
    const isConnected =
      playerId && gameInfo?.connectedPlayers.includes(playerId);

    return (
      <div
        key={slotNumber}
        className={`
          relative flex items-center justify-between p-3 rounded-xl transition-all duration-300 overflow-hidden
          ${
            isCurrentTurn
              ? `bg-gradient-to-r from-${playerColor.bg.split("-")[1]}-50 to-${
                  playerColor.bg.split("-")[1]
                }-100 border-2 ${playerColor.border} shadow-lg`
              : playerId
              ? isConnected
                ? "bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200"
                : "bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300"
              : "bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-dashed border-gray-300"
          }
          ${isCurrentTurn ? "scale-105" : ""}
        `}
      >
        {/* Glow effect for current turn */}
        {isCurrentTurn && (
          <div
            className={`absolute inset-0 bg-gradient-to-r from-${
              playerColor.bg.split("-")[1]
            }-200 to-transparent opacity-50 animate-pulse`}
          ></div>
        )}

        {/* Left side - Avatar and basic info */}
        <div className="flex items-center space-x-3 z-10">
          <div
            className={`
              w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-md
              ${playerColor.bg} ${playerColor.border}
              ${isCurrentTurn ? "animate-pulse shadow-lg" : ""}
              ${
                !playerId
                  ? "opacity-50 grayscale"
                  : !isConnected
                  ? "opacity-75"
                  : ""
              }
            `}
          >
            <span className="text-white font-bold text-sm">{slotNumber}</span>
          </div>

          <div className="flex flex-col">
            <div
              className={`font-semibold text-sm ${
                playerId ? playerColor.text : "text-gray-500"
              }`}
            >
              {playerColor.name}
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`text-xs ${
                  playerId
                    ? isConnected
                      ? "text-green-600"
                      : "text-yellow-600"
                    : "text-gray-500"
                }`}
              >
                {playerId
                  ? isConnected
                    ? "Online"
                    : "Disconnected"
                  : "Waiting..."}
              </div>
              {playerId && isConnected && (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
              )}
              {playerId && !isConnected && (
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Status indicators */}
        <div className="flex items-center space-x-2 z-10">
          {isYou && (
            <div className="px-2 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold rounded-full shadow-sm">
              YOU
            </div>
          )}

          {isCurrentTurn && playerId && isConnected && (
            <div className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full animate-bounce shadow-sm">
              TURN
            </div>
          )}

          {!playerId && (
            <div className="w-6 h-6 border-2 border-dashed border-gray-400 rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed top-4 right-4 bg-white rounded-2xl shadow-xl p-4 min-w-[450px] max-w-[500px] border border-gray-200 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          <h2 className="text-lg font-bold text-gray-800">Players</h2>
        </div>
        {roomId && (
          <div className="bg-gray-100 px-3 py-1 rounded-full">
            <span className="text-sm text-gray-600">Room:</span>
            <span className="font-mono font-semibold text-sm ml-1 text-gray-800">
              {roomId}
            </span>
          </div>
        )}
      </div>

      {/* Players Grid - 2x2 layout for wider appearance */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[1, 2, 3, 4].map(renderPlayerSlot)}
      </div>

      {/* Game Status - Horizontal layout */}
      <div className="border-t pt-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div>
              <span className="text-gray-600">Players:</span>
              <span className="font-semibold ml-1 text-gray-800">
                {gameInfo ? gameInfo.players.length : 0}/4
              </span>
            </div>

            {gameInfo && gameInfo.players.length > 0 && (
              <div>
                <span className="text-gray-600">Connected:</span>
                <span className="font-semibold ml-1 text-green-600">
                  {gameInfo.connectedPlayers.length}/{gameInfo.players.length}
                </span>
              </div>
            )}

            {playerIndex > 0 && (
              <div>
                <span className="text-gray-600">You: {playerIndex}</span>
                <span
                  className={`font-semibold ml-1 ${
                    getPlayerColor(playerIndex).text
                  }`}
                >
                  {getPlayerColor(playerIndex).name}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-600 text-sm">Turn:{currentPlayer}</span>
            <div
              className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
                getPlayerColor(currentPlayer).bg
              } bg-opacity-20`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  getPlayerColor(currentPlayer).bg
                }`}
              ></div>
              <span
                className={`font-semibold text-sm ${
                  getPlayerColor(currentPlayer).text
                }`}
              >
                {getPlayerColor(currentPlayer).name}
              </span>
            </div>
          </div>
        </div>

        {/* Your turn indicator */}
        {currentPlayer === playerIndex &&
          playerIndex > 0 &&
          gameInfo?.gameStarted && (
            <div className="mt-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold text-center py-2 px-4 rounded-xl shadow-lg animate-pulse">
              <span className="inline-flex items-center">
                🎯 <span className="ml-1">YOUR TURN!</span>
              </span>
            </div>
          )}

        {/* Game status indicator */}
        {!gameInfo?.gameStarted && (
          <div className="mt-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold text-center py-2 px-4 rounded-xl shadow-lg">
            <span className="inline-flex items-center">
              ⏳{" "}
              <span className="ml-1">
                WAITING FOR PLAYERS ({gameInfo?.players.length || 0}/4)
              </span>
            </span>
          </div>
        )}

        {gameInfo?.gameStarted &&
          !(currentPlayer === playerIndex && playerIndex > 0) && (
            <div className="mt-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold text-center py-2 px-4 rounded-xl shadow-lg">
              <span className="inline-flex items-center">
                🎮 <span className="ml-1">GAME IN PROGRESS</span>
                {gameInfo.connectedPlayers.length < gameInfo.players.length && (
                  <span className="ml-2 text-xs bg-yellow-500 px-2 py-1 rounded">
                    {gameInfo.players.length - gameInfo.connectedPlayers.length}{" "}
                    DISCONNECTED
                  </span>
                )}
              </span>
            </div>
          )}
      </div>
    </div>
  );
}

export default PlayerBoard;
