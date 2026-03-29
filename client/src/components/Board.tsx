import { DndContext } from "@dnd-kit/core";
import useGameState from "../hooks/useBoard";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { generateBoardCells } from "../utils/boardRenderer";
import BoardGrid from "./BoardGrid";

const Board = () => {
  const {
    gameState: { boardState, currentPlayer, gameStarted },
    dispatchGameState: dispatch,
    playerIndex,
  } = useGameState();

  const {
    validMoves,
    draggedPieceOwner,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useDragAndDrop(boardState, dispatch);

  const cells = generateBoardCells(
    boardState,
    validMoves,
    draggedPieceOwner,
    currentPlayer,
    playerIndex,
    gameStarted || false,
  );

  const boardSize = boardState.length;

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
