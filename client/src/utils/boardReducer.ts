import type { checkersBoardState } from "../types/boardTypes";

// Reducer function to handle board actions
// Accepts current state and an action, returns new state
export const boardReducer = (
  state: checkersBoardState,
  action: { type: string; payload?: object }
): checkersBoardState => {
  switch (action.type) {
    // Add cases for different actions here
    default:
      return state; // Return current state by default
  }
};
