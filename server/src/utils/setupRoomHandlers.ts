import { Socket } from "socket.io";
import { generateRoomId } from "./gameUtils.ts";
import { Game } from "../models/Game.ts";
import { RoomHandlers } from "../handlers/RoomHandlers.ts";

export const setupRoomHandlers = (socket: Socket, games: Map<string, Game>) => {
  // Handle room creation
  const handlers = new RoomHandlers(socket, games);
  socket.on("create-room", handlers.handleRoomCreation);
  socket.on("join-room", handlers.handleRoomJoin);
  socket.on("disconnect", handlers.handlePlayerDisconnect);
};
