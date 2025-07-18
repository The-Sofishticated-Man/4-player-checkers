import { type ReactNode } from "react";

interface BoardGridProps {
  cells: ReactNode[];
  boardSize: number;
}

const BoardGrid = ({ cells, boardSize }: BoardGridProps) => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div
        className="grid w-fit"
        style={{
          gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
        }}
      >
        {cells}
      </div>
    </div>
  );
};

export default BoardGrid;
