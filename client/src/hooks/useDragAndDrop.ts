import { useState } from "react";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { flushSync } from "react-dom";
import type { BoardState } from "../../../shared/types/gameTypes";
import type { BoardAction } from "../utils/boardActions";
import { Board } from "../../../shared/logic/boardModel";
import { useSocket } from "./useSocket";

type BoardPosition = { row: number; col: number };
type MoveResult = {
  moved: boolean;
  shouldContinueCapture: boolean;
  nextPosition?: BoardPosition;
  resultingBoard?: BoardState;
};

export const useDragAndDrop = (
  boardState: BoardState,
  dispatch: React.Dispatch<BoardAction> | undefined,
  allowMoveAnyPiece: boolean = false,
  currentPlayer?: number,
  playerIndex?: number,
  gameStarted: boolean = false,
) => {
  const [validMoves, setValidMoves] = useState<
    { row: number; col: number; isCapture: boolean }[]
  >([]);
  const [draggedPieceOwner, setDraggedPieceOwner] = useState<number | null>(
    null,
  );
  const [activePiece, setActivePiece] = useState<number | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<BoardPosition | null>(
    null,
  );
  const { socket } = useSocket();

  const clearDragState = () => {
    setValidMoves([]);
    setDraggedPieceOwner(null);
    setActivePiece(null);
    setSelectedPiece(null);
  };

  const getPieceOwner = (piece: number) =>
    piece >= 10 ? Math.floor(piece / 10) : piece;

  const canControlPiece = (owner: number): boolean => {
    if (allowMoveAnyPiece) {
      return true;
    }

    return Boolean(gameStarted && playerIndex && owner === playerIndex);
  };

  const selectPiece = (fromRow: number, fromCol: number) => {
    const selected = boardState[fromRow][fromCol];
    if (selected <= 0) {
      clearDragState();
      return;
    }

    const owner = getPieceOwner(selected);
    if (!canControlPiece(owner)) {
      clearDragState();
      return;
    }

    const board = new Board(boardState);
    const moves = allowMoveAnyPiece
      ? board.getValidMoves(fromRow, fromCol)
      : board.getValidMoves(fromRow, fromCol, currentPlayer);

    setSelectedPiece({ row: fromRow, col: fromCol });
    setDraggedPieceOwner(owner);
    setActivePiece(selected);
    setValidMoves(moves);
  };

  const executeMove = (
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
  ): MoveResult => {
    if (fromRow === toRow && fromCol === toCol) {
      return { moved: false, shouldContinueCapture: false };
    }

    const piece = boardState[fromRow]?.[fromCol] ?? 0;
    const owner = getPieceOwner(piece);
    if (piece <= 0 || !canControlPiece(owner)) {
      return { moved: false, shouldContinueCapture: false };
    }

    const board = new Board(boardState);
    const isCaptureMove = board.isCapture(fromRow, fromCol, toRow, toCol);

    const isLocallyValidMove = allowMoveAnyPiece
      ? true
      : board.isValidMoveWithCaptures(
          fromRow,
          fromCol,
          toRow,
          toCol,
          currentPlayer,
        );

    if (!isLocallyValidMove) {
      return { moved: false, shouldContinueCapture: false };
    }

    const moveResult = board.applyMove({ fromRow, fromCol, toRow, toCol });
    const shouldContinueCapture =
      isCaptureMove && !moveResult.shouldChangePlayer;

    if (dispatch) {
      const optimisticAction: BoardAction = allowMoveAnyPiece
        ? {
            type: "SANDBOX_APPLY_MOVE",
            payload: { fromRow, fromCol, toRow, toCol },
          }
        : isCaptureMove
          ? (() => {
              const { capturedRow, capturedCol } = board.getCapturedPosition(
                fromRow,
                fromCol,
                toRow,
                toCol,
              );

              return {
                type: "CAPTURE_PIECE",
                payload: {
                  fromRow,
                  fromCol,
                  toRow,
                  toCol,
                  capturedRow,
                  capturedCol,
                },
              };
            })()
          : {
              type: "MOVE_PIECE",
              payload: { fromRow, fromCol, toRow, toCol },
            };

      // Commit optimistic state immediately so the piece does not wait on server round-trip.
      flushSync(() => {
        dispatch(optimisticAction);
      });
    }

    const roomID = sessionStorage.getItem("currentRoomId");
    socket?.emit("make-move", { roomID, fromRow, fromCol, toRow, toCol });
    return {
      moved: true,
      shouldContinueCapture,
      nextPosition: { row: toRow, col: toCol },
      resultingBoard: moveResult.newBoard,
    };
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;

    // Extract position from piece ID (format: "piece-row-col")
    const pieceId = active.id as string;
    const [, fromRow, fromCol] = pieceId.split("-").map(Number);

    selectPiece(fromRow, fromCol);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      clearDragState();
      return; // No valid drop target
    }

    // Extract position from piece ID (format: "piece-row-col")
    const pieceId = active.id as string;
    const [, fromRow, fromCol] = pieceId.split("-").map(Number);

    // Extract position from cell ID (format: "cell-row-col")
    const cellId = over.id as string;
    const [, toRow, toCol] = cellId.split("-").map(Number);

    executeMove(fromRow, fromCol, toRow, toCol);

    clearDragState();
  };

  const handleDragCancel = () => {
    // Clear drag metadata and highlights when drag is cancelled.
    clearDragState();
  };

  const handlePieceClick = (row: number, col: number) => {
    if (!gameStarted && !allowMoveAnyPiece) {
      return;
    }

    const clickedPiece = boardState[row][col];
    if (clickedPiece <= 0) {
      return;
    }

    const owner = getPieceOwner(clickedPiece);
    if (!canControlPiece(owner)) {
      return;
    }

    if (selectedPiece?.row === row && selectedPiece.col === col) {
      clearDragState();
      return;
    }

    selectPiece(row, col);
  };

  const handleCellClick = (row: number, col: number) => {
    if (!selectedPiece) {
      return;
    }

    if (selectedPiece.row === row && selectedPiece.col === col) {
      clearDragState();
      return;
    }

    const moveResult = executeMove(
      selectedPiece.row,
      selectedPiece.col,
      row,
      col,
    );
    if (!moveResult.moved) {
      return;
    }

    if (
      moveResult.shouldContinueCapture &&
      moveResult.nextPosition &&
      moveResult.resultingBoard
    ) {
      const { row: nextRow, col: nextCol } = moveResult.nextPosition;
      const movedPiece = moveResult.resultingBoard[nextRow][nextCol];
      const owner = getPieceOwner(movedPiece);
      const nextBoard = new Board(moveResult.resultingBoard);
      const nextMoves = allowMoveAnyPiece
        ? nextBoard.getValidMoves(nextRow, nextCol)
        : nextBoard.getValidMoves(nextRow, nextCol, currentPlayer);

      setSelectedPiece({ row: nextRow, col: nextCol });
      setDraggedPieceOwner(owner);
      setActivePiece(movedPiece);
      setValidMoves(nextMoves);
      return;
    }

    clearDragState();
  };

  return {
    validMoves,
    draggedPieceOwner,
    activePiece,
    selectedPiece,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    handlePieceClick,
    handleCellClick,
  };
};
