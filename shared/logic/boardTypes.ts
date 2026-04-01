import type { BoardState } from "../types/gameTypes";

export interface MoveExecutionResult {
  newBoard: BoardState;
  shouldChangePlayer: boolean;
}

export interface ValidMove {
  row: number;
  col: number;
  isCapture: boolean;
}

export interface CapturedPosition {
  capturedRow: number;
  capturedCol: number;
}
