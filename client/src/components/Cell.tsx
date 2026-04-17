import { useDroppable } from "@dnd-kit/core";
import useGameState from "../hooks/useBoard";

const Cell = ({
  isDark,
  row,
  column,
  children,
  isValidMove = false,
  isValidCapture = false,
  isSoftPromotionHint = false,
  draggedPieceOwner = null,
  onClick,
}: {
  isDark: boolean;
  row: number;
  column: number;
  children?: React.ReactNode;
  isValidMove?: boolean;
  isValidCapture?: boolean;
  isSoftPromotionHint?: boolean;
  draggedPieceOwner?: number | null;
  onClick?: () => void;
}) => {
  const {
    gameState: { currentPlayer, boardState },
  } = useGameState();

  // Check if this cell is inaccessible (-1)
  const cellValue = boardState[row][column];
  const isInaccessible = cellValue === -1;

  // Don't render droppable functionality for inaccessible cells
  const { setNodeRef } = useDroppable({
    id: `cell-${row}-${column}`,
    data: { row, column },
    disabled: isInaccessible,
  });

  // Return invisible cell for inaccessible positions
  if (isInaccessible) {
    return <div className="aspect-square w-20 h-20"></div>;
  }

  // Determine cell styling for accessible cells
  const baseStyle = isDark
    ? {
        backgroundColor: "var(--board-dark)",
        borderColor: "var(--board-border)",
      }
    : {
        backgroundColor: "var(--board-light)",
        borderColor: "var(--board-border)",
      };

  // Check if the dragged piece belongs to the current player
  const isCurrentPlayerPiece = draggedPieceOwner === currentPlayer;

  const validMoveMarkup = (isValidMove || isValidCapture) && (
    <div
      className={`rounded-full w-[30%] h-[30%] ${
        isCurrentPlayerPiece ? "" : ""
      }`}
      style={{
        backgroundColor: isCurrentPlayerPiece
          ? "var(--board-valid-move-current)"
          : "var(--board-valid-move-other)",
      }}
    ></div>
  );

  const softPromotionHintMarkup = isSoftPromotionHint && (
    <>
      <div
        className="pointer-events-none absolute inset-1 rounded-sm border-2 border-dashed"
        style={{ borderColor: "var(--board-promotion-border)" }}
      ></div>
      <div
        className="pointer-events-none absolute top-1 right-1 text-[10px] leading-none"
        style={{ color: "var(--board-promotion-mark)" }}
      >
        ♔
      </div>
    </>
  );

  return (
    <div
      ref={setNodeRef}
      className="border-2 relative flex items-center justify-center aspect-square w-20 h-20"
      style={baseStyle}
      id={`cell-${row}-${column}`}
      onClick={onClick}
    >
      {softPromotionHintMarkup}
      {children}
      {validMoveMarkup}
    </div>
  );
};

export default Cell;
