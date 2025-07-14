import { DndContext } from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { useState } from "react";
import useBoard from "../hooks/useBoard";
import {
  isCapture,
  getCapturedPosition,
  getValidMoves,
} from "../logic/boardLogic";
import Cell from "./Cell";
import Piece from "./Piece";

const Board = () => {
  // Generate an 8x8 chessboard
  const {
    state: { checkersBoardState },
    dispatch,
  } = useBoard();

  // Track valid moves for highlighting
  const [validMoves, setValidMoves] = useState<
    { row: number; col: number; isCapture: boolean }[]
  >([]);

  // Track the dragged piece owner
  const [draggedPieceOwner, setDraggedPieceOwner] = useState<number | null>(
    null
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;

    // Extract position from piece ID (format: "piece-row-col")
    const pieceId = active.id as string;
    const [, fromRow, fromCol] = pieceId.split("-").map(Number);

    // Get the piece being dragged and determine its owner
    const draggedPiece = checkersBoardState[fromRow][fromCol];
    const owner =
      draggedPiece >= 10 ? Math.floor(draggedPiece / 10) : draggedPiece;
    setDraggedPieceOwner(owner);

    // Calculate and set valid moves for highlighting
    const moves = getValidMoves(checkersBoardState, fromRow, fromCol);
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
        // Check if this is a capture move
        if (isCapture(fromRow, fromCol, toRow, toCol)) {
          const { capturedRow, capturedCol } = getCapturedPosition(
            fromRow,
            fromCol,
            toRow,
            toCol
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
    }
  };

  const handleDragCancel = () => {
    // Clear valid moves highlighting and dragged piece owner when drag is cancelled
    setValidMoves([]);
    setDraggedPieceOwner(null);
  };

  const cells = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      // Alternate color: true for dark, false for light
      const isDark = (row + col) % 2 === 1;

      // Check if this cell is a valid move
      const validMove = validMoves.find(
        (move) => move.row === row && move.col === col
      );
      const isValidMove = !!validMove && !validMove.isCapture;
      const isValidCapture = !!validMove && validMove.isCapture;

      cells.push(
        <Cell
          key={`${row}-${col}`}
          row={row}
          column={col}
          isDark={isDark}
          isValidMove={isValidMove}
          isValidCapture={isValidCapture}
          draggedPieceOwner={draggedPieceOwner}
        >
          {checkersBoardState[row][col] !== 0 && (
            <Piece
              pieceID={`piece-${row}-${col}`}
              player={checkersBoardState[row][col]}
            />
          )}
        </Cell>
      );
    }
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div>
        <div className="grid grid-cols-8 w-fit border-4 border-black ">
          {cells}
        </div>
      </div>
    </DndContext>
  );
};

export default Board;
