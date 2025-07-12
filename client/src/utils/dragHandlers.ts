import type { DragEndEvent } from "@dnd-kit/core";
import type { checkersBoardState, BoardAction } from "../types/boardTypes";

export const handleDragEnd = (
  event: DragEndEvent,
  state: checkersBoardState,
  dispatch: React.Dispatch<BoardAction>
) => {
  const { active, over } = event;
  if (!active || !over) return;

  // Convert IDs to string before using match
  const pieceId = String(active.id);
  const cellId = String(over.id);
  const pieceMatch = pieceId.match(/piece-(\d+)-(\d+)/);
  const cellMatch = cellId.match(/cell-(\d+)-(\d+)/);
  if (!pieceMatch || !cellMatch) return;

  const fromRow = parseInt(pieceMatch[1], 10);
  const fromCol = parseInt(pieceMatch[2], 10);
  const toRow = parseInt(cellMatch[1], 10);
  const toCol = parseInt(cellMatch[2], 10);

  // Prevent dropping onto the same cell
  if (fromRow === toRow && fromCol === toCol) return;

  // Only move if the target cell is empty
  if (state[toRow][toCol] === 0) {
    dispatch({
      type: "MOVE_PIECE",
      payload: { fromRow, fromCol, toRow, toCol },
    });
  }
};
