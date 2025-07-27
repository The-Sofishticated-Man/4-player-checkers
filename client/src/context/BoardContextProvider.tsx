// Import React functions for context and reducer
import { useReducer, useState } from "react";
import { boardContext } from "./boardContextValue";
import { boardReducer } from "../utils/boardReducer";
import initialState from "../utils/initialState";
import { printBoard } from "../utils/debugUtils";

// Context provider component for the board
// Wraps children with board context
const BoardContextProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize with default state first
  const [state, dispatch] = useReducer(boardReducer, initialState);
  const [playerIndex, setPlayerIndex] = useState(0);

  console.log(`🔍 Current state in provider:`);
  printBoard(state.checkersBoardState);
  console.log(`Current player: ${state.currentPlayer}`);
  console.log(`Player index: ${playerIndex}`);

  return (
    <boardContext.Provider
      value={{
        state,
        dispatch,
        playerIndex,
        setPlayerIndex,
      }}
    >
      {children}
    </boardContext.Provider>
  );
};

// Export the provider for use in the app
export default BoardContextProvider;
