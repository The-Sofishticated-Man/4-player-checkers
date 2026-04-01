import { useState } from "react";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { flushSync } from "react-dom";
import type { BoardState } from "../../../shared/types/gameTypes";
import type { BoardAction } from "../utils/boardActions";
import { Board } from "../../../shared/logic/boardModel";
import { useSocket } from "./useSocket";

export const useDragAndDrop = (
  boardState: BoardState,
  dispatch: React.Dispatch<BoardAction> | undefined,
  allowMoveAnyPiece: boolean = false,
) => {
  const [validMoves, setValidMoves] = useState<
    { row: number; col: number; isCapture: boolean }[]
  >([]);
  const [draggedPieceOwner, setDraggedPieceOwner] = useState<number | null>(
    null,
  );
  const [activePiece, setActivePiece] = useState<number | null>(null);
  const { socket } = useSocket();

  const clearDragState = () => {
    setValidMoves([]);
    setDraggedPieceOwner(null);
    setActivePiece(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;

    // Extract position from piece ID (format: "piece-row-col")
    const pieceId = active.id as string;
    const [, fromRow, fromCol] = pieceId.split("-").map(Number);

    // Get the piece being dragged and determine its owner
    const draggedPiece = boardState[fromRow][fromCol];
    const owner =
      draggedPiece >= 10 ? Math.floor(draggedPiece / 10) : draggedPiece;

    setDraggedPieceOwner(owner);
    setActivePiece(draggedPiece);

    // Calculate and set valid moves for highlighting
    const board = new Board(boardState);
    const moves = board.getValidMoves(fromRow, fromCol);
    setValidMoves(moves);
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

    // Only move if the position actually changed
    if (fromRow !== toRow || fromCol !== toCol) {
      const board = new Board(boardState);
      const isCaptureMove = board.isCapture(fromRow, fromCol, toRow, toCol);
      const isDestinationOccupied = board.isOccupied(toRow, toCol);

      const isLocallyValidMove = allowMoveAnyPiece
        ? true
        : isCaptureMove
          ? board.isValidCaptureForPlayer(fromRow, fromCol, toRow, toCol) &&
            !isDestinationOccupied
          : board.isValidMove(fromRow, fromCol, toRow, toCol);

      if (!isLocallyValidMove) {
        clearDragState();
        return;
      }

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
    }

    clearDragState();
  };

  const handleDragCancel = () => {
    // Clear drag metadata and highlights when drag is cancelled.
    clearDragState();
  };

  return {
    validMoves,
    draggedPieceOwner,
    activePiece,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
};
