import type { MouseEvent } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import PieceSvg from "./PieceSvg";

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
