import {
  type gameState,
  type BoardAction,
} from "../../../shared/types/boardTypes";
// Type for the context value: contains board state and dispatch function
// state: current game state
// dispatch: function to update board state
export type boardContextType = {
  state: gameState;
  dispatch: React.Dispatch<BoardAction>; // Dispatch function for actions
  playerIndex: number;
  setPlayerIndex: (index: number) => void;
};
