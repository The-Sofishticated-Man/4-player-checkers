import { useEffect, useState } from "react";
import useBoard from "../hooks/useBoard";
import { useSocket } from "../hooks/useSocket";

interface GameInfo {
  players: string[];
  playerId: string;
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

    // Request current game state to get player list
    socket.emit("get-game-state", roomId);

    // Listen for game state response
    const handleGameState = (data: {
      boardState: number[][];
      currentPlayer: number;
      players: string[];
      playerId: string;
    }) => {
      setGameInfo({
        players: data.players,
        playerId: data.playerId,
      });
    };

    // Listen for player disconnection
    const handlePlayerDisconnected = ({ playerId }: { playerId: string }) => {
      console.log(`Player disconnected: ${playerId}`);
      setGameInfo((prevInfo) => {
        if (!prevInfo) return null;
        return {
          ...prevInfo,
          players: prevInfo.players.filter((id) => id !== playerId),
        };
      });
    };

    // Listen for new player joins (when player-joined is broadcast to others)
    const handlePlayerJoined = (data: {
      roomID: string;
      boardState: number[][];
      currentPlayer: number;
      playerId: string;
      playerIndex: number;
    }) => {
      console.log(`New player joined: ${data.playerId}`);
      // Request updated game state to get the full player list
      socket.emit("get-game-state", roomId);
    };

    // Listen for player reconnections
    const handlePlayerReconnected = (data: {
      roomID: string;
      boardState: number[][];
      currentPlayer: number;
      playerId: string;
      playerIndex: number;
    }) => {
      console.log(`Player reconnected: ${data.playerId}`);
      // Request updated game state to get the full player list
      socket.emit("get-game-state", roomId);
    };

    socket.on("game-state", handleGameState);
    socket.on("player-disconnected", handlePlayerDisconnected);
    socket.on("player-joined", handlePlayerJoined);
    socket.on("player-reconnected", handlePlayerReconnected);

    return () => {
      socket.off("game-state", handleGameState);
      socket.off("player-disconnected", handlePlayerDisconnected);
      socket.off("player-joined", handlePlayerJoined);
      socket.off("player-reconnected", handlePlayerReconnected);
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
    const hasPlayer = gameInfo && gameInfo.players[slotNumber - 1];

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
              : hasPlayer
              ? "bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200"
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
              ${!hasPlayer ? "opacity-50 grayscale" : ""}
            `}
          >
            <span className="text-white font-bold text-sm">{slotNumber}</span>
          </div>

          <div className="flex flex-col">
            <div
              className={`font-semibold text-sm ${
                hasPlayer ? playerColor.text : "text-gray-500"
              }`}
            >
              {playerColor.name}
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`text-xs ${
                  hasPlayer ? "text-gray-600" : "text-gray-500"
                }`}
              >
                {hasPlayer ? "Online" : "Waiting..."}
              </div>
              {hasPlayer && (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
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

          {isCurrentTurn && hasPlayer && (
            <div className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full animate-bounce shadow-sm">
              TURN
            </div>
          )}

          {!hasPlayer && (
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

            {playerIndex > 0 && (
              <div>
                <span className="text-gray-600">You:</span>
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
            <span className="text-gray-600 text-sm">Turn:</span>
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
        {currentPlayer === playerIndex && playerIndex > 0 && (
          <div className="mt-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold text-center py-2 px-4 rounded-xl shadow-lg animate-pulse">
            <span className="inline-flex items-center">
              🎯 <span className="ml-1">YOUR TURN!</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayerBoard;
