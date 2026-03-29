// Import React functions for context and reducer
import { useReducer, useState } from "react";
import { gameContext } from "./boardContextValue";
import { boardReducer } from "../utils/boardReducer";
import initialState from "../../../server/src/utils/initialGameState";
import type { GameState, PlayerIndex } from "../../../shared/types/gameTypes";
import type { BoardAction } from "../utils/boardActions";

// Context provider component for the board
// Wraps children with board context
const GameContextProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize with default state first
  const [gameState, dispatch] = useReducer<GameState, [BoardAction]>(
    boardReducer,
    initialState,
  );
  const [playerIndex, setPlayerIndex] = useState<PlayerIndex>(1);

  return (
    <gameContext.Provider
      value={{
        gameState,
        dispatchGameState: dispatch,
        playerIndex,
        setPlayerIndex,
      }}
    >
      {children}
    </gameContext.Provider>
  );
};

// Export the provider for use in the app
export default GameContextProvider;
