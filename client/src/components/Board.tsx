import { DndContext, DragOverlay } from "@dnd-kit/core";
import useGameState from "../hooks/useBoard";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { generateBoardCells } from "../utils/boardRenderer";
import BoardGrid from "./BoardGrid";

interface BoardProps {
  allowMoveAnyPiece?: boolean;
}

const Board = ({ allowMoveAnyPiece = false }: BoardProps) => {
  const {
    gameState: { boardState, currentPlayer, gameStarted },
    dispatchGameState: dispatch,
    playerIndex,
  } = useGameState();

  const {
    validMoves,
    draggedPieceOwner,
    activePiece,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useDragAndDrop(boardState, dispatch, allowMoveAnyPiece);

  const renderOverlayPiece = () => {
    if (!activePiece || activePiece < 0) {
      return null;
    }

    const kingPiece = activePiece >= 10;
    const owner = kingPiece ? Math.floor(activePiece / 10) : activePiece;

    const getPlayerColor = (playerNum: number) => {
      switch (playerNum) {
        case 1:
          return "bg-red-500";
        case 2:
          return "bg-blue-500";
        case 3:
          return "bg-green-500";
        case 4:
          return "bg-yellow-500";
        default:
          return "bg-gray-500";
      }
    };

    return (
      <div
        className={`${getPlayerColor(owner)} ${
          kingPiece ? "border-4 border-yellow-400" : ""
        } w-10 h-10 rounded-full aspect-square flex items-center justify-center`}
      >
        {kingPiece && (
          <span className="text-yellow-400 font-bold text-xs">♔</span>
        )}
      </div>
    );
  };

  const cells = generateBoardCells(
    boardState,
    validMoves,
    draggedPieceOwner,
    currentPlayer,
    playerIndex,
    gameStarted || false,
    allowMoveAnyPiece,
  );

  const boardSize = boardState.length;

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <BoardGrid cells={cells} boardSize={boardSize} />
      <DragOverlay dropAnimation={null}>{renderOverlayPiece()}</DragOverlay>
    </DndContext>
  );
};

export default Board;
