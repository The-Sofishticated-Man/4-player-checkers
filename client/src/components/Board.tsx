import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import useGameState from "../hooks/useBoard";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { generateBoardCells } from "../utils/boardRenderer";
import BoardGrid from "./BoardGrid";

interface BoardProps {
  allowMoveAnyPiece?: boolean;
}

const Board = ({ allowMoveAnyPiece = false }: BoardProps) => {
  const {
    gameState: { boardState, currentPlayer, gameStarted, gameOver },
    dispatchGameState: dispatch,
    playerIndex,
  } = useGameState();

  const {
    validMoves,
    draggedPieceOwner,
    activePiece,
    selectedPiece,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    handlePieceClick,
    handleCellClick,
  } = useDragAndDrop(
    boardState,
    dispatch,
    allowMoveAnyPiece,
    currentPlayer,
    playerIndex,
    gameStarted,
  );

  // Keep click-to-select separate from drag by requiring small pointer movement.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const renderOverlayPiece = () => {
    if (!activePiece || activePiece < 0) {
      return null;
    }

    const kingPiece = activePiece >= 10;
    const owner = kingPiece ? Math.floor(activePiece / 10) : activePiece;

    const getPlayerColor = (playerNum: number) => {
      switch (playerNum) {
        case 1:
          return "bg-[var(--player-1)]";
        case 2:
          return "bg-[var(--player-2)]";
        case 3:
          return "bg-[var(--player-3)]";
        case 4:
          return "bg-[var(--player-4)]";
        default:
          return "bg-[var(--app-muted)]";
      }
    };

    return (
      <div
        className={`${getPlayerColor(owner)} ${
          kingPiece ? "border-4 border-[var(--board-promotion-border)]" : ""
        } w-10 h-10 rounded-full aspect-square flex items-center justify-center`}
      >
        {kingPiece && (
          <span className="text-[var(--board-promotion-mark)] font-bold text-xs">
            ♔
          </span>
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
    (gameStarted || false) && !gameOver,
    allowMoveAnyPiece,
    selectedPiece,
    handlePieceClick,
    handleCellClick,
  );

  const boardSize = boardState.length;

  return (
    <DndContext
      sensors={sensors}
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
