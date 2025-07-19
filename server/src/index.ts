import express from "express";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// CORS middleware
app.use(
  cors({
    origin: "*", // Allow all origins for simplicity, adjust as needed
  })
);

const expressServer = app.listen(PORT, () => {
  console.log(`${new Date()} || server running at port: ${PORT}`);
});

const io = new Server(expressServer, {
  cors: {
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST"],
    credentials: true,
  },
});

interface gameState {
  players: string[]; // Array of persistent player IDs
  boardState: number[][]; // 2D array representing the board state
  currentPlayer: number; // 1,2,3,4
  socketToPlayer: Map<string, string>; // Maps socket IDs to persistent player IDs
}

const games = new Map<string, gameState>();

// Generate unique room ID
function generateRoomId() {
  return Math.random().toString(36).substring(2, 9).toUpperCase(); // e.g., "A7B2K9X"
}

// Generate unique player ID
function generatePlayerId() {
  return Math.random().toString(36).substring(2, 15); // e.g., "a7b2k9x1m"
}

io.on("connection", (socket) => {
  console.log(`${new Date().toISOString()}: a user connected`);

  // Handle room creation
  socket.on("create-room", (initialBoard, playerId) => {
    const roomID = generateRoomId(); // Generate unique room ID
    games.set(roomID, {
      players: [playerId], // Add creator as first player
      boardState: initialBoard,
      currentPlayer: 1, // Red starts first
      socketToPlayer: new Map([[socket.id, playerId]]),
    });
    socket.join(roomID);
    socket.emit("room-created", { roomID, boardState: initialBoard, playerId });
    console.log(`Room created: ${roomID} by player: ${playerId}`);
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
  });
});
