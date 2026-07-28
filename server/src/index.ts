import express from "express";
import cors from "cors";
import path from "node:path";
import { existsSync } from "node:fs";
import { Server } from "socket.io";
import { Game } from "./models/Game.ts";
import { setupRoomHandlers } from "./utils/setupRoomHandlers.ts";
import { setupMoveHandlers } from "./utils/setupMoveHandlers.ts";
import { setupSandboxHandlers } from "./utils/setupSandboxHandlers.ts";
import { setupChatHandlers } from "./utils/setupChatHandlers.ts";
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
import {
  emitSystemChatMessage,
  getPlayerDisplayName,
} from "./utils/chatMessages.ts";

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const CLIENT_DIST_PATH = path.resolve(process.cwd(), "../client/dist");
const CLIENT_INDEX_PATH = path.join(CLIENT_DIST_PATH, "index.html");

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// CORS middleware
app.use(
  cors({
    origin: FRONTEND_URL,
  }),
);

if (existsSync(CLIENT_INDEX_PATH)) {
  app.use(express.static(CLIENT_DIST_PATH));

  app.get(/.*/, (req, res, next) => {
    if (req.method !== "GET" || !req.accepts("html")) {
      next();
      return;
    }

    res.sendFile(CLIENT_INDEX_PATH);
  });
}

const expressServer = app.listen(PORT, () => {
  console.log(`${new Date()} || server running at port: ${PORT}`);
  console.log(
    existsSync(CLIENT_INDEX_PATH)
      ? `serving client build from ${CLIENT_DIST_PATH}`
      : "client build not found; SPA deep links will 404",
  );
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
      const timedOutPlayerId = Array.from(game.players.keys())[
        timedOutPlayer - 1
      ];
      eliminatePlayerFromGame(game, timedOutPlayer);

      if (timedOutPlayerId) {
        emitSystemChatMessage(
          io,
          roomID,
          game,
          `${getPlayerDisplayName(game, timedOutPlayerId)} died.`,
        );
      }

      const payload = createGameStateEventPayload(game);
      io.to(roomID).emit("move-made", payload);

      if (payload.gameOver) {
        io.to(roomID).emit("game-over", payload);
        if (payload.winner) {
          const winnerPlayerId = Array.from(game.players.keys())[
            payload.winner - 1
          ];
          if (winnerPlayerId) {
            emitSystemChatMessage(
              io,
              roomID,
              game,
              `${getPlayerDisplayName(game, winnerPlayerId)} wins the game.`,
            );
          }
        }
      }

      continue;
    }

    io.to(roomID).emit("clock-sync", createClockSyncPayload(game));
  }
}, DEFAULT_CLOCK_SYNC_INTERVAL_MS);

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Track total connected clients and broadcast to all clients
  // Note: this is a simple in-memory count for the running process.
  // It will be reset on server restart.
  // Increment and broadcast on new connection
  (io as any).connectedClients = ((io as any).connectedClients || 0) + 1;
  io.emit("online-count", (io as any).connectedClients);

  // Setup room handlers
  setupRoomHandlers(socket, games);

  // Setup move handlers
  setupMoveHandlers(socket, games);

  // Setup sandbox handlers
  setupSandboxHandlers(socket, games);

  // Setup chat handlers
  setupChatHandlers(socket, games);

  socket.on("disconnect", () => {
    (io as any).connectedClients = Math.max(
      0,
      ((io as any).connectedClients || 1) - 1,
    );
    io.emit("online-count", (io as any).connectedClients);
  });

  // Allow clients to request the current online count
  socket.on("request-online-count", () => {
    socket.emit("online-count", (io as any).connectedClients || 0);
  });
});
