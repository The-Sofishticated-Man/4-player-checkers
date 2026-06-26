import { Socket } from "socket.io";
import { Game } from "../models/Game.ts";
import { ChatHandlers } from "../handlers/chatHandlers.ts";

export const setupChatHandlers = (socket: Socket, games: Map<string, Game>) => {
  const handlers = new ChatHandlers(socket, games);
  socket.on("send-message", handlers.handleSendMessage);
};
