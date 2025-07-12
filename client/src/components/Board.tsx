import { DndContext } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import useBoard from "../hooks/useBoard";
import Cell from "./Cell";
import Piece from "./Piece";

const Board = () => {
  // Generate an 8x8 chessboard
  const { state, dispatch } = useBoard();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return; // No valid drop target

    // Extract position from piece ID (format: "piece-row-col")
    const pieceId = active.id as string;
    const [, fromRow, fromCol] = pieceId.split("-").map(Number);

    // Extract position from cell ID (format: "cell-row-col")
    const cellId = over.id as string;
    const [, toRow, toCol] = cellId.split("-").map(Number);

    // Only move if the position actually changed
    if (dispatch) {
      dispatch({
        type: "MOVE_PIECE",
        payload: { fromRow, fromCol, toRow, toCol },
      });
    }
  };

  const cells = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      // Alternate color: true for dark, false for light
      const isDark = (row + col) % 2 === 1;
      cells.push(
        <Cell key={`${row}-${col}`} row={row} column={col} isDark={isDark}>
          {state[row][col] !== 0 && (
            <Piece pieceID={`piece-${row}-${col}`} player={state[row][col]} />
          )}
        </Cell>
      );
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div>
        <div className="grid grid-cols-8 w-fit border-4 border-black ">
          {cells}
        </div>
      </div>
    </DndContext>
  );
};

export default Board;
