import type {
  BoardState,
  MoveCoordinates,
  PlayerIndex,
} from "../types/gameTypes";
import {
  getCapturedPosition as calculateCapturedPosition,
  getNextPlayer as calculateNextPlayer,
  isCapture as isCaptureMove,
  moveIsOutOfBounds as isOutOfBounds,
  positionChanged as hasPositionChanged,
} from "./boardGeometry.ts";
import {
  getValidMoves as calculateValidMoves,
  hasAnyCaptureForPlayer as calculateHasAnyCaptureForPlayer,
  hasValidCapture as calculateHasValidCapture,
  isValidCaptureForPlayer as validateCaptureForPlayer,
  isValidMoveWithCaptures as validateMoveWithCaptures,
} from "./boardCaptures.ts";
import {
  executeCaptureMove as applyCaptureMove,
  executeRegularMove as applyRegularMove,
} from "./boardExecutionCore.ts";
import {
  isOccupied as cellIsOccupied,
  isPlayersTurn as validatePlayersTurn,
  isValidDiagonalMoveForPlayer as validateDiagonalMoveForPlayer,
  isValidMove as validateMove,
} from "./boardValidation.ts";
import type {
  CapturedPosition,
  MoveExecutionResult,
  ValidMove,
} from "./boardTypes.ts";

export type { CapturedPosition, MoveExecutionResult, ValidMove };

export class Board {
  private readonly boardState: BoardState;

  constructor(boardState: BoardState) {
    this.boardState = boardState;
  }

  public isOccupied(row: number, col: number): boolean {
    return cellIsOccupied(this.boardState, row, col);
  }

  public positionChanged(
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
  ): boolean {
    return hasPositionChanged(fromRow, fromCol, toRow, toCol);
  }

  public moveIsOutOfBounds(toRow: number, toCol: number): boolean {
    return isOutOfBounds(this.boardState, toRow, toCol);
  }

  public isPlayersTurn(
    fromRow: number,
    fromCol: number,
    currentPlayer: number,
  ): boolean {
    return validatePlayersTurn(
      this.boardState,
      fromRow,
      fromCol,
      currentPlayer,
    );
  }

  public isValidDiagonalMoveForPlayer(
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
  ): boolean {
    return validateDiagonalMoveForPlayer(
      this.boardState,
      fromRow,
      fromCol,
      toRow,
      toCol,
    );
  }

  public isValidMove(
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
  ): boolean {
    return validateMove(this.boardState, fromRow, fromCol, toRow, toCol);
  }

  public isValidCaptureForPlayer(
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
  ): boolean {
    return validateCaptureForPlayer(
      this.boardState,
      fromRow,
      fromCol,
      toRow,
      toCol,
    );
  }

  public isCapture(
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
  ): boolean {
    return isCaptureMove(fromRow, fromCol, toRow, toCol);
  }

  public static isCapture(
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
  ): boolean {
    return isCaptureMove(fromRow, fromCol, toRow, toCol);
  }

  public getCapturedPosition(
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
  ): CapturedPosition {
    return calculateCapturedPosition(fromRow, fromCol, toRow, toCol);
  }

  public static getCapturedPosition(
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
  ): CapturedPosition {
    return calculateCapturedPosition(fromRow, fromCol, toRow, toCol);
  }

  public hasValidCapture(fromRow: number, fromCol: number): boolean {
    return calculateHasValidCapture(this.boardState, fromRow, fromCol);
  }

  public hasAnyCapture(player: number): boolean {
    return calculateHasAnyCaptureForPlayer(this.boardState, player);
  }

  public getValidMoves(
    fromRow: number,
    fromCol: number,
    currentPlayer?: number,
  ): ValidMove[] {
    return calculateValidMoves(
      this.boardState,
      fromRow,
      fromCol,
      currentPlayer,
    );
  }

  public isValidMoveWithCaptures(
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
    currentPlayer?: number,
  ): boolean {
    return validateMoveWithCaptures(
      this.boardState,
      fromRow,
      fromCol,
      toRow,
      toCol,
      currentPlayer,
    );
  }

  public executeCaptureMove({
    fromRow,
    fromCol,
    toRow,
    toCol,
  }: MoveCoordinates): MoveExecutionResult {
    return applyCaptureMove(this.boardState, {
      fromRow,
      fromCol,
      toRow,
      toCol,
    });
  }

  public executeRegularMove({
    fromRow,
    fromCol,
    toRow,
    toCol,
  }: MoveCoordinates): MoveExecutionResult {
    return applyRegularMove(this.boardState, {
      fromRow,
      fromCol,
      toRow,
      toCol,
    });
  }

  public applyMove(move: MoveCoordinates): MoveExecutionResult {
    if (this.isCapture(move.fromRow, move.fromCol, move.toRow, move.toCol)) {
      return this.executeCaptureMove(move);
    }

    return this.executeRegularMove(move);
  }

  public static getNextPlayer(currentPlayer: PlayerIndex): PlayerIndex {
    return calculateNextPlayer(currentPlayer);
  }
}
