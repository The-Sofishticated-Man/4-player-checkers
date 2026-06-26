import { Socket } from "socket.io";
import { Game } from "../models/Game.ts";
import { ChatMessage } from "../../../shared/types/gameTypes.ts";

export class ChatHandlers {
  private socket: Socket;
  private games: Map<string, Game>;

  constructor(socket: Socket, games: Map<string, Game>) {
    this.socket = socket;
    this.games = games;

    this.handleSendMessage = this.handleSendMessage.bind(this);
  }

  handleSendMessage(
    roomId: string,
    messageText: string,
    callback?: (response?: { ok: boolean; message?: string }) => void,
  ) {
    const playerId = this.socket.data.playerId as string | undefined;
    console.log(
      `[chat] send-message received socket=${this.socket.id} room=${roomId} playerId=${playerId ?? "<missing>"} textLength=${messageText?.length ?? 0}`,
    );

    const game = this.games.get(roomId);
    if (!game) {
      console.warn(`[chat] rejected: game not found for room=${roomId}`);
      if (callback) callback({ ok: false, message: "Game not found" });
      return;
    }

    if (!playerId) {
      console.warn(
        `[chat] rejected: socket ${this.socket.id} is missing playerId for room=${roomId}`,
      );
      if (callback)
        callback({ ok: false, message: "Player not found or not in game" });
      return;
    }

    const playerData = game.players.get(playerId);
    if (!playerData) {
      console.warn(
        `[chat] rejected: no player state for playerId=${playerId} in room=${roomId}`,
      );
      if (callback)
        callback({ ok: false, message: "Player not found or not in game" });
      return;
    }

    const newMessage: ChatMessage = {
      playerId,
      senderName: playerData.nickname,
      text: messageText.trim(),
      timestamp: Date.now(),
    };

    if (!Array.isArray(game.gameState.messages)) {
      console.warn(
        `[chat] game state for room=${roomId} was missing messages array; initializing it`,
      );
      game.gameState.messages = [];
    }

    game.gameState.messages.push(newMessage);

    console.log(
      `[chat] stored message room=${roomId} playerId=${playerId} nickname=${playerData.nickname} totalMessages=${game.gameState.messages.length}`,
    );

    // Broadcast to the room, including the sender so the UI updates immediately.
    this.socket.nsp.to(roomId).emit("chat-message", newMessage);

    if (callback) callback({ ok: true });
  }
}
