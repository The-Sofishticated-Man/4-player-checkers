import { useDroppable } from "@dnd-kit/core";

const Cell = ({
  isDark,
  row,
  column,
  children,
}: {
  isDark: boolean;
  row: number;
  column: number;
  children?: React.ReactNode;
}) => {
  // Enable droppable functionality for each cell
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${row}-${column}`,
    data: { row, column },
  });
  return (
    <div
      ref={setNodeRef}
      className={`${
        isDark ? "bg-amber-700" : "bg-amber-200"
      } flex items-center justify-center aspect-square w-20 h-20 ${
        isOver ? "ring-4 ring-green-500" : ""
      }`}
      id={`cell-${row}-${column}`}
    >
      {children}
    </div>
  );
};

export default Cell;
