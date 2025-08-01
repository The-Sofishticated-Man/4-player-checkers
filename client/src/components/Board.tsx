import { DndContext } from "@dnd-kit/core";
import useBoard from "../hooks/useBoard";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { generateBoardCells } from "../utils/boardRenderer";
import BoardGrid from "./BoardGrid";

const Board = () => {
  const {
    state: { checkersBoardState, currentPlayer },
    dispatch,
    playerIndex,
  } = useBoard();

  const {
    validMoves,
    draggedPieceOwner,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useDragAndDrop(checkersBoardState, currentPlayer, playerIndex, dispatch);

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
      <BoardGrid cells={cells} boardSize={boardSize} />
    </DndContext>
  );
};

export default Board;
