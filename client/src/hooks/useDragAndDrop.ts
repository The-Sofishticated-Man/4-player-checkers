import { useState } from "react";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
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
  const { socket } = useSocket();

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

    // Calculate and set valid moves for highlighting
    const board = new Board(boardState);
    const moves = board.getValidMoves(fromRow, fromCol);
    setValidMoves(moves);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    // Clear valid moves highlighting and dragged piece owner
    setValidMoves([]);
    setDraggedPieceOwner(null);

    const { active, over } = event;

    if (!over) return; // No valid drop target

    // Extract position from piece ID (format: "piece-row-col")
    const pieceId = active.id as string;
    const [, fromRow, fromCol] = pieceId.split("-").map(Number);

    // Extract position from cell ID (format: "cell-row-col")
    const cellId = over.id as string;
    const [, toRow, toCol] = cellId.split("-").map(Number);

    // Only move if the position actually changed
    if (fromRow !== toRow || fromCol !== toCol) {
      if (dispatch) {
        if (!allowMoveAnyPiece) {
          const board = new Board(boardState);

          // Check if this is a capture move
          if (board.isCapture(fromRow, fromCol, toRow, toCol)) {
            const { capturedRow, capturedCol } = board.getCapturedPosition(
              fromRow,
              fromCol,
              toRow,
              toCol,
            );
            dispatch({
              type: "CAPTURE_PIECE",
              payload: {
                fromRow,
                fromCol,
                toRow,
                toCol,
                capturedRow,
                capturedCol,
              },
            });
          } else {
            dispatch({
              type: "MOVE_PIECE",
              payload: { fromRow, fromCol, toRow, toCol },
            });
          }
        }

        const roomID = sessionStorage.getItem("currentRoomId");
        socket!.emit("make-move", { roomID, fromRow, fromCol, toRow, toCol });
      }
    }
  };

  const handleDragCancel = () => {
    // Clear valid moves highlighting and dragged piece owner when drag is cancelled
    setValidMoves([]);
    setDraggedPieceOwner(null);
  };

  return {
    validMoves,
    draggedPieceOwner,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
};
