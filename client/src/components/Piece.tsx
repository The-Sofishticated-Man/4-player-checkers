import type { MouseEvent } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

type PiecePalette = {
  fill: string;
};

const getPiecePalette = (playerNumber: number): PiecePalette => {
  switch (playerNumber) {
    case 1:
      return {
        fill: "var(--piece-1-fill)",
      };
    case 2:
      return {
        fill: "var(--piece-2-fill)",
      };
    case 3:
      return {
        fill: "var(--piece-3-fill)",
      };
    case 4:
      return {
        fill: "var(--piece-4-fill)",
      };
    default:
      return {
        fill: "var(--piece-default-fill)",
      };
  }
};

export const PieceSvg = ({
  playerNumber,
  isKing,
  className = "",
}: {
  playerNumber: number;
  isKing: boolean;
  className?: string;
}) => {
  const palette = getPiecePalette(playerNumber);

  return (
    <div className={`relative aspect-square ${className}`}>
      <div
        className="h-full w-full rounded-full"
        style={{
          backgroundColor: palette.fill,
          border: "4px solid var(--piece-outline)",
          boxSizing: "border-box",
        }}
      />
      {isKing && (
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] font-bold"
          style={{ color: "var(--board-promotion-mark)" }}
        >
          ♔
        </span>
      )}
    </div>
  );
};

const Piece = ({
  pieceID,
  player,
  disabled = false,
  isSelected = false,
  onClick,
}: {
  pieceID: string;
  player: number;
  disabled?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: pieceID,
      disabled,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0 : 1,
  };

  // Determine piece type and owning player
  const isKing = player >= 10;
  const playerNumber = isKing ? Math.floor(player / 10) : player;
  const cursorStyle = !disabled && "cursor-pointer";
  const selectedStyle = isSelected
    ? "ring-4 ring-[color:var(--app-surface-strong)]"
    : "";

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (disabled) {
      return;
    }
    onClick?.();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(disabled ? {} : listeners)}
      className={`${cursorStyle} ${selectedStyle} mx-auto my-auto flex aspect-square h-14 w-14 items-center justify-center rounded-full`}
      onClick={handleClick}
    >
      <PieceSvg
        playerNumber={playerNumber}
        isKing={isKing}
        className="h-full w-full"
      />
    </div>
  );
};

export default Piece;
