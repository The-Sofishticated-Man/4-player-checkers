// Import React functions for context and reducer
import { useReducer } from "react";
import { boardContext } from "./boardContextValue";
import { boardReducer } from "../utils/boardReducer";
import type { gameState } from "../types/boardTypes";
import initialState from "../utils/initialState";

// Context provider component for the board
// Wraps children with board context
const BoardContextProvider = ({
  children,
  initialStateFromServer,
}: {
  children: React.ReactNode;
  initialStateFromServer: gameState;
}) => {
  // useReducer hook to manage board state
  const [state, dispatch] = useReducer(
    boardReducer,
    initialStateFromServer || initialState // Use initialStateFromServer if provided, otherwise use default initialState
  );
  return (
    <boardContext.Provider value={{ state, dispatch }}>
      {children}
    </boardContext.Provider>
  );
};

// Export the provider for use in the app
export default BoardContextProvider;
