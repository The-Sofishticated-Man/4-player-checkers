import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { Game } from "./models/Game.ts";
import { setupRoomHandlers } from "./utils/setupRoomHandlers.ts";
import { setupMoveHandlers } from "./utils/setupMoveHandlers.ts";
import { MIN_PLAYERS_TO_START, SANDBOX_MODE } from "./utils/devSandbox.ts";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// CORS middleware
app.use(
  cors({
    origin: "*", // Allow all origins for simplicity, adjust as needed
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
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const games = new Map<string, Game>();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Setup room handlers
  setupRoomHandlers(socket, games);

  // Setup move handlers
  setupMoveHandlers(socket, games);
});
