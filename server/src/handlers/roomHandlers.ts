import { Socket } from "socket.io";
import { type gameState } from "../../../shared/types/gameTypes.ts";
import { generateRoomId } from "../utils/gameUtils.ts";

export const setupRoomHandlers = (
  socket: Socket,
  games: Map<string, gameState>
) => {
  // Handle room creation
  socket.on("create-room", (initialBoard, playerId) => {
    const roomID = generateRoomId(); // Generate unique room ID
    games.set(roomID, {
      players: [],
      boardState: initialBoard,
      currentPlayer: 1, // Red starts first
      socketToPlayer: new Map([]),
    });
    socket.join(roomID);
    socket.emit("room-created", { roomID });
    console.log(`Room created: ${roomID}`);
  });

  socket.on("join-room", (roomID, playerId) => {
    console.log(
      `User ${socket.id} (${playerId}) trying to join room: ${roomID}`
    );
    const game = games.get(roomID);
    if (game) {
      // Check if player is already in the game (reconnecting)
      if (game.players.includes(playerId)) {
        game.socketToPlayer.set(socket.id, playerId);
        socket.join(roomID);
        socket.emit("room-joined", {
          roomID,
          boardState: game.boardState,
          currentPlayer: game.currentPlayer,
          playerId,
        });
        console.log(`Player ${playerId} reconnected to room: ${roomID}`);
        return;
      }

      // New player joining
      if (game.players.length >= 4) {
        console.log(`Room ${roomID} is full (4 players max)`);
        socket.emit("room-full", roomID);
        return;
      }

      game.players.push(playerId);
      game.socketToPlayer.set(socket.id, playerId);
      socket.join(roomID);
      socket.emit("room-joined", {
        roomID,
        boardState: game.boardState,
        currentPlayer: game.currentPlayer,
        playerId,
      });
      console.log(
        `User ${socket.id} added to room: ${roomID}. Players: ${game.players.length}/4`
      );
    } else {
      console.log(`Room not found: ${roomID}`);
      socket.emit("room-not-found", roomID);
    }

    // Debug: Visualize game state after join
    if (game) {
      console.log(`\n🎮 GAME STATE - Room: ${roomID}`);
      console.log(`👥 Players: [${game.players.join(", ")}]`);
      console.log(`🎯 Current Player: ${game.currentPlayer}`);
      console.log(`🔌 Socket to Player mapping:`);
      console.table(Object.fromEntries(game.socketToPlayer));
      console.log(`📊 Player positions:`);
      game.players.forEach((playerId, index) => {
        const isCurrentTurn = game.currentPlayer === index + 1;
        console.log(
          `   Player ${index + 1}: ${playerId} ${
            isCurrentTurn ? "🔥 (CURRENT TURN)" : ""
          }`
        );
      });
    }
  });

  // Handle player disconnection
  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id}`);
    // Note: We don't remove the player from the game, just their socket mapping
    // This allows them to reconnect with the same playerId
    for (const [roomID, game] of games) {
      if (game.socketToPlayer.has(socket.id)) {
        const playerId = game.socketToPlayer.get(socket.id);
        game.socketToPlayer.delete(socket.id);
        console.log(`Player ${playerId} disconnected from room ${roomID}`);
        socket.to(roomID).emit("player-disconnected", { playerId });
        break;
      }
    }
  });
};
