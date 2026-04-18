import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { Game } from "./models/Game.ts";
import { setupRoomHandlers } from "./utils/setupRoomHandlers.ts";
import { setupMoveHandlers } from "./utils/setupMoveHandlers.ts";
import { setupSandboxHandlers } from "./utils/setupSandboxHandlers.ts";
import { MIN_PLAYERS_TO_START, SANDBOX_MODE } from "./utils/devSandbox.ts";
import {
  DEFAULT_CLOCK_SYNC_INTERVAL_MS,
  advanceClock,
} from "./utils/gameClock.ts";
import { eliminatePlayerFromGame } from "./utils/gameLifecycle.ts";
import {
  createClockSyncPayload,
  createGameStateEventPayload,
} from "./utils/sandboxEvents.ts";

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// CORS middleware
app.use(
  cors({
    origin: FRONTEND_URL,
  }),
);

const expressServer = app.listen(PORT, () => {
  console.log(`${new Date()} || server running at port: ${PORT}`);
  console.log(
    `sandbox mode: ${SANDBOX_MODE ? "ON" : "OFF"} (min players to start: ${MIN_PLAYERS_TO_START})`,
  );
});

const io = new Server(expressServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const games = new Map<string, Game>();

setInterval(() => {
  for (const [roomID, game] of games.entries()) {
    if (!game.gameStarted || game.gameState.gameOver) {
      continue;
    }

    const timedOutPlayer = advanceClock(game.gameState);
    if (timedOutPlayer !== null) {
      eliminatePlayerFromGame(game, timedOutPlayer);

      const payload = createGameStateEventPayload(game);
      io.to(roomID).emit("move-made", payload);

      if (payload.gameOver) {
        io.to(roomID).emit("game-over", payload);
      }

      continue;
    }

    io.to(roomID).emit("clock-sync", createClockSyncPayload(game));
  }
}, DEFAULT_CLOCK_SYNC_INTERVAL_MS);

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Setup room handlers
  setupRoomHandlers(socket, games);

  // Setup move handlers
  setupMoveHandlers(socket, games);

  // Setup sandbox handlers
  setupSandboxHandlers(socket, games);
});
