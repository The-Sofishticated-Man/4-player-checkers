import { useDroppable } from "@dnd-kit/core";
import useGameState from "../hooks/useBoard";
import deathAnimationGif from "../sprites/death_animation.gif";
import type { BorderSide } from "../utils/boardPerimeterBorders";

const PERIMETER_BORDER_WIDTH = "2px";

const Cell = ({
  isDark,
  row,
  column,
  children,
  inaccessibleContent,
  isValidMove = false,
  isValidCapture = false,
  isSoftPromotionHint = false,
  showDeathAnimation = false,
  borderSides = [],
  draggedPieceOwner = null,
  onClick,
}: {
  isDark: boolean;
  row: number;
  column: number;
  children?: React.ReactNode;
  inaccessibleContent?: React.ReactNode;
  isValidMove?: boolean;
  isValidCapture?: boolean;
  isSoftPromotionHint?: boolean;
  showDeathAnimation?: boolean;
  borderSides?: readonly BorderSide[];
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
    return (
      <div className="relative aspect-square h-17 w-17 overflow-visible">
        {inaccessibleContent}
      </div>
    );
  }

  // Determine cell styling for accessible cells
  const baseStyle = isDark
    ? {
        backgroundColor: "var(--board-dark)",
      }
    : {
        backgroundColor: "var(--board-light)",
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

  const borderStyleMap: Record<BorderSide, React.CSSProperties> = {
    top: {
      top: `calc(-1 * ${PERIMETER_BORDER_WIDTH})`,
      left: 0,
      right: 0,
      height: PERIMETER_BORDER_WIDTH,
      borderTopLeftRadius: PERIMETER_BORDER_WIDTH,
      borderTopRightRadius: PERIMETER_BORDER_WIDTH,
    },
    right: {
      top: 0,
      right: `calc(-1 * ${PERIMETER_BORDER_WIDTH})`,
      bottom: 0,
      width: PERIMETER_BORDER_WIDTH,
      borderTopRightRadius: PERIMETER_BORDER_WIDTH,
      borderBottomRightRadius: PERIMETER_BORDER_WIDTH,
    },
    bottom: {
      left: 0,
      right: 0,
      bottom: `calc(-1 * ${PERIMETER_BORDER_WIDTH})`,
      height: PERIMETER_BORDER_WIDTH,
      borderBottomLeftRadius: PERIMETER_BORDER_WIDTH,
      borderBottomRightRadius: PERIMETER_BORDER_WIDTH,
    },
    left: {
      top: 0,
      left: `calc(-1 * ${PERIMETER_BORDER_WIDTH})`,
      bottom: 0,
      width: PERIMETER_BORDER_WIDTH,
      borderTopLeftRadius: PERIMETER_BORDER_WIDTH,
      borderBottomLeftRadius: PERIMETER_BORDER_WIDTH,
    },
  };

  const cornerCapMap: Array<{
    key: string;
    style: React.CSSProperties;
  }> = [];

  if (borderSides.includes("top") && borderSides.includes("left")) {
    cornerCapMap.push({
      key: "top-left",
      style: {
        top: `calc(-1 * ${PERIMETER_BORDER_WIDTH})`,
        left: `calc(-1 * ${PERIMETER_BORDER_WIDTH})`,
        width: PERIMETER_BORDER_WIDTH,
        height: PERIMETER_BORDER_WIDTH,
        borderTopLeftRadius: PERIMETER_BORDER_WIDTH,
      },
    });
  }

  if (borderSides.includes("top") && borderSides.includes("right")) {
    cornerCapMap.push({
      key: "top-right",
      style: {
        top: `calc(-1 * ${PERIMETER_BORDER_WIDTH})`,
        right: `calc(-1 * ${PERIMETER_BORDER_WIDTH})`,
        width: PERIMETER_BORDER_WIDTH,
        height: PERIMETER_BORDER_WIDTH,
        borderTopRightRadius: PERIMETER_BORDER_WIDTH,
      },
    });
  }

  if (borderSides.includes("bottom") && borderSides.includes("left")) {
    cornerCapMap.push({
      key: "bottom-left",
      style: {
        bottom: `calc(-1 * ${PERIMETER_BORDER_WIDTH})`,
        left: `calc(-1 * ${PERIMETER_BORDER_WIDTH})`,
        width: PERIMETER_BORDER_WIDTH,
        height: PERIMETER_BORDER_WIDTH,
        borderBottomLeftRadius: PERIMETER_BORDER_WIDTH,
      },
    });
  }

  if (borderSides.includes("bottom") && borderSides.includes("right")) {
    cornerCapMap.push({
      key: "bottom-right",
      style: {
        bottom: `calc(-1 * ${PERIMETER_BORDER_WIDTH})`,
        right: `calc(-1 * ${PERIMETER_BORDER_WIDTH})`,
        width: PERIMETER_BORDER_WIDTH,
        height: PERIMETER_BORDER_WIDTH,
        borderBottomRightRadius: PERIMETER_BORDER_WIDTH,
      },
    });
  }

  const borderOverlays = borderSides.map((side) => (
    <div
      key={side}
      className="pointer-events-none absolute z-10"
      style={{
        backgroundColor: "var(--board-perimeter-border)",
        ...borderStyleMap[side],
      }}
    />
  ));

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
      className="relative flex aspect-square h-17 w-17 items-center justify-center"
      style={baseStyle}
      id={`cell-${row}-${column}`}
      onClick={onClick}
    >
      {borderOverlays}
      {cornerCapMap.map((corner) => (
        <div
          key={corner.key}
          className="pointer-events-none absolute z-20"
          style={{
            backgroundColor: "var(--board-perimeter-border)",
            ...corner.style,
          }}
        />
      ))}
      {softPromotionHintMarkup}
      {showDeathAnimation && (
        <img
          src={deathAnimationGif}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="pointer-events-none absolute inset-0 z-30 h-full w-full object-contain"
        />
      )}
      {children}
      {validMoveMarkup}
    </div>
  );
};

export default Cell;
