// Import React functions for context and reducer
import { useReducer } from "react";
import { boardContext } from "./boardContextValue";
import { initialBoard } from "../utils/initialBoard";
import { boardReducer } from "../utils/boardReducer";

// Context provider component for the board
// Wraps children with board context
const BoardContextProvider = ({ children }: { children: React.ReactNode }) => {
  // useReducer hook to manage board state
  const [state, dispatch] = useReducer(boardReducer, initialBoard);
  return (
    <boardContext.Provider value={{ state, dispatch }}>
      {children}
    </boardContext.Provider>
  );
};

// Export the provider for use in the app
export default BoardContextProvider;
