import { useDroppable } from "@dnd-kit/core";
import useBoard from "../hooks/useBoard";

const Cell = ({
  isDark,
  row,
  column,
  children,
  isValidMove = false,
  isValidCapture = false,
  draggedPieceOwner = null,
}: {
  isDark: boolean;
  row: number;
  column: number;
  children?: React.ReactNode;
  isValidMove?: boolean;
  isValidCapture?: boolean;
  draggedPieceOwner?: number | null;
}) => {
  const {
    state: { currentPlayer, checkersBoardState },
  } = useBoard();

  // Check if this cell is inaccessible (-1)
  const cellValue = checkersBoardState[row][column];
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
  const baseColor = isDark ? "bg-amber-700" : "bg-amber-200";

  // Check if the dragged piece belongs to the current player
  const isCurrentPlayerPiece = draggedPieceOwner === currentPlayer;

  const validMoveMarkup = (isValidMove || isValidCapture) && (
    <div
      className={`rounded-full w-[30%] h-[30%] ${
        isCurrentPlayerPiece ? "bg-green-800" : "bg-gray-500"
      }`}
    ></div>
  );

  return (
    <div
      ref={setNodeRef}
      className={`${baseColor} border-2  flex items-center justify-center aspect-square w-20 h-20`}
      id={`cell-${row}-${column}`}
    >
      {children}
      {validMoveMarkup}
    </div>
  );
};

export default Cell;
