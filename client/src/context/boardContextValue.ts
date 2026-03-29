import { createContext } from "react";
import type { GameContextType } from "../types/contextTypes";
import initialGameState from "../../../server/src/utils/initialGameState";

// Create the board context with default values
export const gameContext = createContext<GameContextType>({
  gameState: initialGameState,
  dispatchGameState: () => {}, // Default dispatch (no-op)
  playerIndex: 1,
  setPlayerIndex: () => {},
});
