import { createContext } from "react";
import { type boardContextType } from "../types/boardTypes";
import initialState from "../utils/initialState";

// Create the board context with default values
export const boardContext = createContext<boardContextType>({
  state: initialState,
  dispatch: () => {}, // Default dispatch (no-op)
  playerIndex: 0, // Default player index (can be updated later in context provider)
  setPlayerIndex: () => {}, // Default setter (no-op)
});
