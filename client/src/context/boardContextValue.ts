import { createContext } from "react";
import type { boardContextType } from "../types/boardTypes";
import { initialBoard } from "../utils/initialBoard";

// Create the board context with default values
export const boardContext = createContext<boardContextType>({
  state: initialBoard, // Default board state
  dispatch: () => {}, // Default dispatch (no-op)
});
