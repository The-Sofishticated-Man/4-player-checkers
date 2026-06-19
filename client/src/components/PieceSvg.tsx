type PiecePalette = {
  fill: string;
};

export const getPiecePalette = (playerNumber: number): PiecePalette => {
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

const PieceSvg = ({
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

export default PieceSvg;
