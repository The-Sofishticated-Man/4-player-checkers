import { Socket } from "socket.io";
import { Game } from "../models/Game.ts";
import { MoveHandlers } from "../handlers/MoveHandlers.ts";

export const setupMoveHandlers = (socket: Socket, games: Map<string, Game>) => {
  const handlers = new MoveHandlers(socket, games);
  socket.on("make-move", handlers.handleMakeMove);
};
