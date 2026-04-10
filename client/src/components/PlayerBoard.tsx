import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import useGameState from "../hooks/useBoard";
import { useSocket } from "../hooks/useSocket";

const loadingSlots = [1, 2, 3, 4] as const;

export function PlayerBoardSkeleton() {
  return (
    <div className="fixed top-4 right-4 bg-white rounded-2xl shadow-xl p-4 min-w-[450px] max-w-[500px] border border-gray-200 backdrop-blur-sm">
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-24 rounded-md bg-slate-200"></div>
          <div className="h-8 w-44 rounded-full bg-slate-200"></div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {loadingSlots.map((slot) => (
            <div
              key={slot}
              className="flex items-center justify-between p-3 rounded-xl border-2 border-slate-200 bg-slate-50"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-300"></div>
                <div className="space-y-2">
                  <div className="h-3 w-20 rounded bg-slate-300"></div>
                  <div className="h-2 w-14 rounded bg-slate-200"></div>
                </div>
              </div>
              <div className="h-6 w-14 rounded-md bg-slate-300"></div>
            </div>
          ))}
        </div>

        <div className="border-t pt-3 space-y-2">
          <div className="h-4 w-full rounded bg-slate-200"></div>
          <div className="h-10 w-full rounded-xl bg-slate-200"></div>
        </div>
      </div>
    </div>
  );
}

function PlayerBoard() {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [isForfeiting, setIsForfeiting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const {
    gameState: {
      currentPlayer,
      players,
      gameStarted,
      gameOver,
      winner,
      isDraw,
      activePlayers,
      clock,
    },
    playerIndex,
  } = useGameState();
  const [clockNowMs, setClockNowMs] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setClockNowMs(Date.now());
    }, 200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const formatClock = (remainingMs: number): string => {
    const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");

    return `${minutes}:${seconds}`;
  };

  const getDisplayRemainingMs = (slotNumber: number): number => {
    const slot = slotNumber as 1 | 2 | 3 | 4;
    const baseRemainingMs = clock.remainingMs[slot] ?? 0;

    if (
      clock.paused ||
      clock.runningPlayer !== slot ||
      clock.lastUpdatedAtMs === null ||
      gameOver
    ) {
      return baseRemainingMs;
    }

    const elapsedMs = Math.max(0, clockNowMs - clock.lastUpdatedAtMs);
    return Math.max(0, baseRemainingMs - elapsedMs);
  };
  const playerEntries = Array.from(players.entries());
  const connectedPlayers = playerEntries.filter(
    ([, player]) => player.isConnected,
  );
  const connectedPlayerIds = connectedPlayers.map(([playerId]) => playerId);
  const playerSlots = [1, 2, 3, 4] as const;
  const forfeitedPlayers = playerSlots.filter((slot) =>
    Boolean(playerEntries[slot - 1]?.[1].leftGame),
  );
  const defeatedPlayers = playerSlots.filter(
    (slot) => !(activePlayers ?? playerSlots).includes(slot),
  );
  const isYouForfeited =
    playerIndex > 0 &&
    forfeitedPlayers.includes(playerIndex as (typeof playerSlots)[number]);
  const isYouDefeated =
    playerIndex > 0 &&
    defeatedPlayers.includes(playerIndex as (typeof playerSlots)[number]);

  // Get the current room ID from session storage
  const roomId = sessionStorage.getItem("currentRoomId");

  const fallbackCopyToClipboard = (text: string): boolean => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textArea);
    return copied;
  };

  const handleCopyGameLink = async () => {
    if (!roomId) {
      return;
    }

    const gameLink = new URL(
      `/game/${roomId}`,
      window.location.origin,
    ).toString();
    let copied = false;

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(gameLink);
        copied = true;
      } catch {
        copied = false;
      }
    }

    if (!copied) {
      copied = fallbackCopyToClipboard(gameLink);
    }

    if (!copied) {
      alert("Unable to copy the game link right now.");
      return;
    }

    setLinkCopied(true);
    window.setTimeout(() => setLinkCopied(false), 1800);
  };

  const handleForfeitGame = () => {
    if (
      !socket ||
      !roomId ||
      playerIndex <= 0 ||
      isForfeiting ||
      isYouForfeited
    ) {
      return;
    }

    const confirmed = window.confirm(
      "Forfeit this game and leave the room? This cannot be undone.",
    );
    if (!confirmed) {
      return;
    }

    setIsForfeiting(true);
    socket.emit(
      "forfeit-game",
      roomId,
      (response?: { ok: boolean; message?: string }) => {
        setIsForfeiting(false);

        if (!response?.ok) {
          alert(response?.message ?? "Unable to forfeit right now");
          return;
        }

        sessionStorage.removeItem("currentRoomId");
        navigate("/");
      },
    );
  };

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
    const playerEntry = playerEntries[slotNumber - 1];
    const playerId = playerEntry?.[0];
    const nickname = playerEntry?.[1].nickname;
    const displayName = playerId
      ? (nickname ?? `P_${playerId}`)
      : `${playerColor.name} Slot`;
    const isConnected = Boolean(playerEntry?.[1].isConnected);
    const hasLeftGame = Boolean(playerEntry?.[1].leftGame);
    const isDefeated =
      Boolean(playerId) &&
      defeatedPlayers.includes(slotNumber as (typeof playerSlots)[number]);
    const remainingMs = getDisplayRemainingMs(slotNumber);
    const clockLabel = formatClock(remainingMs);
    const isLowTime = remainingMs <= 10_000;
    const isOutOfTime = remainingMs === 0;

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
              : hasLeftGame
                ? "bg-gradient-to-r from-rose-100 to-red-100 border-2 border-rose-400"
                : isDefeated
                  ? "bg-gradient-to-r from-slate-100 to-slate-200 border-2 border-slate-400"
                  : playerId
                    ? isConnected
                      ? "bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200"
                      : "bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300"
                    : "bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-dashed border-gray-300"
          }
          ${isCurrentTurn ? "scale-105" : ""}
          ${isDefeated ? "opacity-80" : ""}
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
                  : hasLeftGame
                    ? "opacity-60 grayscale"
                    : isDefeated
                      ? "opacity-60 grayscale"
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
                !playerId
                  ? "text-gray-500"
                  : hasLeftGame
                    ? "text-rose-700"
                    : isDefeated
                      ? "text-slate-600"
                      : playerColor.text
              }`}
            >
              {displayName}
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-xs text-gray-500">{playerColor.name}</div>
              <div
                className={`text-xs ${
                  playerId
                    ? hasLeftGame
                      ? "text-rose-700"
                      : isDefeated
                        ? "text-rose-700"
                        : isConnected
                          ? "text-green-600"
                          : "text-yellow-600"
                    : "text-gray-500"
                }`}
              >
                {playerId
                  ? hasLeftGame
                    ? "Forfeited"
                    : isDefeated
                      ? "Defeated"
                      : isConnected
                        ? "Online"
                        : "Disconnected"
                  : "Waiting..."}
              </div>
              {playerId && hasLeftGame && (
                <div className="w-2 h-2 bg-rose-600 rounded-full"></div>
              )}
              {playerId && isDefeated && (
                <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
              )}
              {playerId && !hasLeftGame && !isDefeated && isConnected && (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
              )}
              {playerId && !hasLeftGame && !isDefeated && !isConnected && (
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Status indicators */}
        <div className="flex items-center space-x-2 z-10">
          <div
            className={`px-2 py-1 rounded-md text-xs font-semibold tabular-nums border shadow-sm ${
              isOutOfTime
                ? "bg-rose-700 text-white border-rose-700"
                : isLowTime
                  ? "bg-amber-100 text-amber-800 border-amber-300"
                  : "bg-slate-100 text-slate-700 border-slate-300"
            }`}
          >
            {clockLabel}
          </div>

          {isYou && (
            <div className="px-2 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold rounded-full shadow-sm">
              YOU
            </div>
          )}

          {hasLeftGame && (
            <div className="px-2 py-1 bg-gradient-to-r from-rose-600 to-red-700 text-white text-xs font-bold rounded-full shadow-sm">
              FORFEITED
            </div>
          )}

          {!hasLeftGame && isDefeated && (
            <div className="px-2 py-1 bg-gradient-to-r from-rose-500 to-red-600 text-white text-xs font-bold rounded-full shadow-sm">
              DEFEATED
            </div>
          )}

          {isCurrentTurn &&
            playerId &&
            isConnected &&
            !isDefeated &&
            !hasLeftGame && (
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
        <div className="flex items-center space-x-2">
          {roomId && (
            <div className="bg-gray-100 px-3 py-1 rounded-full">
              <span className="text-sm text-gray-600">Room:</span>
              <span className="font-mono font-semibold text-sm ml-1 text-gray-800">
                {roomId}
              </span>
            </div>
          )}
          {roomId && (
            <button
              type="button"
              onClick={handleCopyGameLink}
              className="px-3 py-1 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-700 shadow-sm"
            >
              {linkCopied ? "LINK COPIED" : "COPY LINK"}
            </button>
          )}
          {playerIndex > 0 && !gameOver && (
            <button
              type="button"
              onClick={handleForfeitGame}
              disabled={isForfeiting || isYouForfeited}
              className="px-3 py-1 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-rose-600 to-red-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isYouForfeited
                ? "FORFEITED"
                : isForfeiting
                  ? "FORFEITING..."
                  : "FORFEIT"}
            </button>
          )}
          {playerIndex > 0 && gameOver && (
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem("currentRoomId");
                navigate("/");
              }}
              className="px-3 py-1 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-slate-600 to-slate-700 shadow-sm"
            >
              EXIT
            </button>
          )}
        </div>
      </div>

      {/* Players Grid - 2x2 layout for wider appearance */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {playerSlots.map(renderPlayerSlot)}
      </div>

      {/* Game Status - Horizontal layout */}
      <div className="border-t pt-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div>
              <span className="text-gray-600">Players:</span>
              <span className="font-semibold ml-1 text-gray-800">
                {playerEntries.length}/4
              </span>
            </div>

            {playerEntries.length > 0 && (
              <div>
                <span className="text-gray-600">Connected:</span>
                <span className="font-semibold ml-1 text-green-600">
                  {connectedPlayers.length}/{playerEntries.length}
                </span>
              </div>
            )}

            {defeatedPlayers.length > 0 && (
              <div>
                <span className="text-gray-600">Defeated:</span>
                <span className="font-semibold ml-1 text-rose-600">
                  {defeatedPlayers
                    .map((slot) => getPlayerColor(slot).name)
                    .join(", ")}
                </span>
              </div>
            )}

            {forfeitedPlayers.length > 0 && (
              <div>
                <span className="text-gray-600">Forfeited:</span>
                <span className="font-semibold ml-1 text-red-700">
                  {forfeitedPlayers
                    .map((slot) => getPlayerColor(slot).name)
                    .join(", ")}
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
          gameStarted &&
          !gameOver && (
            <div className="mt-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold text-center py-2 px-4 rounded-xl shadow-lg animate-pulse">
              <span className="inline-flex items-center">
                🎯 <span className="ml-1">YOUR TURN!</span>
              </span>
            </div>
          )}

        {isYouForfeited && gameStarted && !gameOver && (
          <div className="mt-3 bg-gradient-to-r from-rose-600 to-red-700 text-white text-sm font-semibold text-center py-2 px-4 rounded-xl shadow-lg">
            <span className="inline-flex items-center">
              🚪 <span className="ml-1">YOU FORFEITED THIS GAME</span>
            </span>
          </div>
        )}

        {!isYouForfeited && isYouDefeated && gameStarted && !gameOver && (
          <div className="mt-3 bg-gradient-to-r from-rose-500 to-red-600 text-white text-sm font-semibold text-center py-2 px-4 rounded-xl shadow-lg">
            <span className="inline-flex items-center">
              💥 <span className="ml-1">YOU ARE DEFEATED - TURN SKIPPED</span>
            </span>
          </div>
        )}

        {/* Game status indicator */}
        {!gameStarted && !gameOver && (
          <div className="mt-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold text-center py-2 px-4 rounded-xl shadow-lg">
            <span className="inline-flex items-center">
              ⏳{" "}
              <span className="ml-1">
                WAITING FOR PLAYERS ({playerEntries.length}/4)
              </span>
            </span>
          </div>
        )}

        {gameOver && (
          <div
            className={`mt-3 text-white text-sm font-semibold text-center py-2 px-4 rounded-xl shadow-lg ${
              isDraw
                ? "bg-gradient-to-r from-slate-600 to-slate-800"
                : "bg-gradient-to-r from-rose-600 to-red-700"
            }`}
          >
            <span className="inline-flex items-center">
              {isDraw ? "🤝" : "🏆"}
              <span className="ml-1">
                {isDraw ? "DRAW" : `GAME OVER - PLAYER ${winner} WINS`}
              </span>
            </span>
          </div>
        )}

        {gameStarted &&
          !gameOver &&
          !(currentPlayer === playerIndex && playerIndex > 0) && (
            <div className="mt-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold text-center py-2 px-4 rounded-xl shadow-lg">
              <span className="inline-flex items-center">
                🎮 <span className="ml-1">GAME IN PROGRESS</span>
                {connectedPlayerIds.length < playerEntries.length && (
                  <span className="ml-2 text-xs bg-yellow-500 px-2 py-1 rounded">
                    {playerEntries.length - connectedPlayerIds.length}{" "}
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
