import type {
  GameClockState,
  GameState,
  MoveCoordinates,
  ChatMessage,
} from "../../../shared/types/gameTypes";

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
      payload: MoveCoordinates;
    }
  | {
      type: "SANDBOX_APPLY_MOVE";
      payload: MoveCoordinates;
    }
  | {
      type: "CAPTURE_PIECE";
      payload: MoveCoordinates & {
        capturedRow: number;
        capturedCol: number;
      };
    }
  | {
      type: "UPDATE_CLOCK";
      payload: {
        clock: GameClockState;
      };
    }
  | {
      type: "NEW_CHAT_MESSAGE";
      payload: {
        message: ChatMessage;
      };
    }
  | {
      type: string;
      payload?: never;
    };
