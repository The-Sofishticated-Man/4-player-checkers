import { type ReactNode } from "react";

export type BoardGridOverlay = {
  key: string;
  rowStart: number;
  colStart: number;
  rowSpan?: number;
  colSpan?: number;
  className?: string;
  content: ReactNode;
};

interface BoardGridProps {
  cells: ReactNode[];
  boardSize: number;
  overlays?: BoardGridOverlay[];
}

const BoardGrid = ({ cells, boardSize, overlays = [] }: BoardGridProps) => {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-0 z-20 grid"
          style={{
            gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${boardSize}, minmax(0, 1fr))`,
          }}
        >
          {overlays.map((overlay) => (
            <div
              key={overlay.key}
              className={overlay.className}
              style={{
                gridColumn: `${overlay.colStart} / span ${overlay.colSpan ?? 1}`,
                gridRow: `${overlay.rowStart} / span ${overlay.rowSpan ?? 1}`,
              }}
            >
              {overlay.content}
            </div>
          ))}
        </div>

        <div
          className="grid w-fit"
          style={{
            gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
          }}
        >
          {cells}
        </div>
      </div>
    </div>
  );
};

export default BoardGrid;
