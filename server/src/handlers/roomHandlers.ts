import { Socket } from "socket.io";
import { type gameState } from "../../../shared/types/gameTypes.ts";
import { generateRoomId } from "../utils/gameUtils.ts";

export const setupRoomHandlers = (
  socket: Socket,
  games: Map<string, gameState>
) => {
  // Handle room creation
  socket.on("create-room", (initialBoard) => {
    const roomID = generateRoomId(); // Generate unique room ID
    games.set(roomID, {
      players: [],
      boardState: initialBoard,
      currentPlayer: 1, // Red starts first
      connectedPlayers: new Map([]),
      gameStarted: false, // Game hasn't started yet
    });
    socket.join(roomID);
    socket.emit("room-created", { roomID });
    console.log(`Room created: ${roomID}`);
  });

  // Handle getting current game state
  socket.on("get-game-state", (roomID) => {
    const game = games.get(roomID);
    if (game) {
      const connectedPlayerIds = Array.from(game.connectedPlayers.values());
      socket.emit("game-state", {
        players: game.players,
        connectedPlayers: connectedPlayerIds,
        gameStarted: game.gameStarted,
        currentPlayer: game.currentPlayer,
        roomID,
      });
    }
  });

  socket.on("join-room", (roomID, playerId) => {
    console.log(
      `User ${socket.id} (${playerId}) trying to join room: ${roomID}`
    );
    const game = games.get(roomID);
    if (game) {
      // Check if player is already in the game (reconnecting)
      if (game.players.includes(playerId)) {
        // Handle player reconnection by adding their socket
        game.connectedPlayers.set(socket.id, playerId);
        socket.join(roomID);
        const playerIndex = game.players.indexOf(playerId) + 1; // 1-based index

        // Emit to the reconnecting player
        socket.emit("room-joined", {
          roomID,
          boardState: game.boardState,
          currentPlayer: game.currentPlayer,
          playerId,
          playerIndex,
          gameStarted: game.gameStarted,
          players: game.players,
          connectedPlayers: Array.from(game.connectedPlayers.values()),
        });

        // Broadcast to all other players that someone reconnected
        socket.to(roomID).emit("player-reconnected", {
          roomID,
          boardState: game.boardState,
          currentPlayer: game.currentPlayer,
          playerId,
          playerIndex,
          gameStarted: game.gameStarted,
          players: game.players,
          connectedPlayers: Array.from(game.connectedPlayers.values()),
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
      game.connectedPlayers.set(socket.id, playerId);
      socket.join(roomID);
      const playerIndex = game.players.indexOf(playerId) + 1; // 1-based index

      // Check if game should start (4 players joined)
      const shouldStartGame = !game.gameStarted && game.players.length === 4;
      if (shouldStartGame) {
        game.gameStarted = true;
        console.log(
          `🎮 Game started in room: ${roomID} - All 4 players connected!`
        );
      }

      // Emit to the joining player
      socket.emit("room-joined", {
        roomID,
        boardState: game.boardState,
        currentPlayer: game.currentPlayer,
        playerId,
        playerIndex,
        gameStarted: game.gameStarted,
        players: game.players,
        connectedPlayers: Array.from(game.connectedPlayers.values()),
      });

      // Broadcast to all other players in the room that someone joined
      socket.to(roomID).emit("player-joined", {
        roomID,
        boardState: game.boardState,
        currentPlayer: game.currentPlayer,
        playerId,
        playerIndex,
        gameStarted: game.gameStarted,
        players: game.players,
        connectedPlayers: Array.from(game.connectedPlayers.values()),
      });

      // If game just started, broadcast game-started event to all players
      if (shouldStartGame) {
        socket.to(roomID).emit("game-started", {
          roomID,
          boardState: game.boardState,
          currentPlayer: game.currentPlayer,
        });
        socket.emit("game-started", {
          roomID,
          boardState: game.boardState,
          currentPlayer: game.currentPlayer,
        });
      }

      console.log(
        `User ${socket.id} added to room: ${roomID}. Players: ${
          game.players.length
        }/4${shouldStartGame ? " - GAME STARTED!" : ""}`
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
      console.table(Object.fromEntries(game.connectedPlayers));
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
    // Remove the socket mapping but keep the player in the game
    for (const [roomID, game] of games) {
      if (game.connectedPlayers.has(socket.id)) {
        const playerId = game.connectedPlayers.get(socket.id);
        game.connectedPlayers.delete(socket.id);
        console.log(`Player ${playerId} disconnected from room ${roomID}`);

        // Broadcast updated connection state to all remaining players
        socket.to(roomID).emit("player-disconnected", {
          playerId,
          players: game.players,
          connectedPlayers: Array.from(game.connectedPlayers.values()),
        });
        break;
      }
    }
  });
};
