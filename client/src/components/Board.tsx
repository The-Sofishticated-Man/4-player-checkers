import { DndContext } from "@dnd-kit/core";
import useBoard from "../hooks/useBoard";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { generateBoardCells } from "../utils/boardRenderer";
import { useSocket } from "../hooks/useSocket";
import BoardGrid from "./BoardGrid";

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

  const { socket, isConnected } = useSocket();

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
      <p className="text-sm text-gray-600 mt-4">
        Status:{" "}
        {isConnected
          ? "✅ Connected (Socket ID: " + socket?.id + ")"
          : "❌ Disconnected"}
      </p>
    </DndContext>
  );
};

export default Board;
