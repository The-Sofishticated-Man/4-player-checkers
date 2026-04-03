import { Socket } from "socket.io";
import { Game } from "../models/Game.ts";
import { SandboxHandlers } from "../handlers/sandboxHandlers.ts";

export const setupSandboxHandlers = (
  socket: Socket,
  games: Map<string, Game>,
) => {
  const handlers = new SandboxHandlers(socket, games);

  socket.on("sandbox-get-room-state", handlers.handleSandboxGetRoomState);
  socket.on("sandbox-set-state", handlers.handleSandboxSetState);

  // Backward compatibility with old dev panel event name.
  socket.on("debug-set-state", handlers.handleSandboxSetState);
};
