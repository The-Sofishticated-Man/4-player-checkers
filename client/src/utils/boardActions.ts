import type { GameState } from "../../../shared/types/gameTypes";

// Type for board actions
export type BoardAction =
  | {
      type: "UPDATE_GAME_STATE";
      payload: {
        newGameState: GameState; // New game state after the move
      };
    }
  | {
      type: "MOVE_PIECE";
      payload: {
        fromRow: number;
        fromCol: number;
        toRow: number;
        toCol: number;
      };
    }
  | {
      type: "CAPTURE_PIECE";
      payload: {
        fromRow: number;
        fromCol: number;
        toRow: number;
        toCol: number;
        capturedRow: number;
        capturedCol: number;
      };
    }
  | {
      type: string;
      payload?: never;
    };
