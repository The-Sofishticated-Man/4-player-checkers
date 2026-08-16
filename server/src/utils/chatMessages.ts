import type { Server, Socket } from "socket.io";
import { Game } from "../models/Game.ts";
import type { ChatMessage, PlayerId } from "../../../shared/types/gameTypes.ts";

type ChatEmitter = Server | Socket;

const ensureMessageList = (game: Game): ChatMessage[] => {
  if (!Array.isArray(game.gameState.messages)) {
    game.gameState.messages = [];
  }

  return game.gameState.messages;
};

export const createUserChatMessage = (
  playerId: PlayerId,
  senderName: string,
  text: string,
): ChatMessage => ({
  playerId,
  senderName,
  text: text.trim(),
  timestamp: Date.now(),
  kind: "user",
});

export const createSystemChatMessage = (text: string): ChatMessage => ({
  playerId: "system",
  senderName: "System",
  text: text.trim(),
  timestamp: Date.now(),
  kind: "system",
});

export const appendChatMessage = (game: Game, message: ChatMessage): void => {
  ensureMessageList(game).push(message);
};

export const emitChatMessage = (
  emitter: ChatEmitter,
  roomId: string,
  game: Game,
  message: ChatMessage,
): void => {
  appendChatMessage(game, message);

  const roomEmitter = emitter.to(roomId);
  roomEmitter.emit("chat-message", message);
};

export const emitSystemChatMessage = (
  emitter: ChatEmitter,
  roomId: string,
  game: Game,
  text: string,
): ChatMessage => {
  const message = createSystemChatMessage(text);
  emitChatMessage(emitter, roomId, game, message);
  return message;
};

export const getPlayerDisplayName = (
  game: Game,
  playerId: PlayerId,
): string => {
  const playerData = game.players.get(playerId);
  const playerIndex = game.getPlayerIndexFromId(playerId);

  return playerData?.nickname ?? `P_${playerIndex}`;
};
