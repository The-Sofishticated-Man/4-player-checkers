import { DndContext } from "@dnd-kit/core";
import useBoard from "../hooks/useBoard";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { generateBoardCells } from "../utils/boardRenderer";

const Board = () => {
  const {
    state: { checkersBoardState },
    dispatch,
  } = useBoard();

  const {
    validMoves,
    draggedPieceOwner,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useDragAndDrop(checkersBoardState, dispatch);

  const cells = generateBoardCells(
    checkersBoardState,
    validMoves,
    draggedPieceOwner
  );

  const boardSize = checkersBoardState.length;

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex items-center justify-center h-screen">
        <div
          className="grid w-fit "
          style={{
            gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
          }}
        >
          {cells}
        </div>
      </div>
    </DndContext>
  );
};

export default Board;
