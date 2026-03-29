import type { PlayerIndex } from "./../../../shared/types/gameTypes";
import type { Socket } from "socket.io-client";
import type { GameState } from "../../../shared/types/gameTypes";
import type { ActionDispatch } from "react";
import type { BoardAction } from "../utils/boardActions";

export interface GameContextType {
  gameState: GameState;
  dispatchGameState: ActionDispatch<[BoardAction]>;
  playerIndex: PlayerIndex;
  setPlayerIndex: (playerIndex: PlayerIndex) => void;
}
export interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}
