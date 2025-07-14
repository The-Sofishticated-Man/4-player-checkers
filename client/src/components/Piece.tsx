import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

const Piece = ({ pieceID, player }: { pieceID: string; player: number }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: pieceID,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  // Determine piece type and color
  const isKing = player >= 10;
  const playerNumber = isKing ? Math.floor(player / 10) : player;

  // Color mapping for players (ready for 4 players)
  const getPlayerColor = (playerNum: number) => {
    switch (playerNum) {
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-blue-500";
      case 3:
        return "bg-green-500";
      case 4:
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const playerColor = getPlayerColor(playerNumber);
  const borderStyle = isKing ? "border-4 border-yellow-400" : "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${playerColor} ${borderStyle} w-10 h-10 rounded-full mx-auto my-auto aspect-square cursor-pointer flex items-center justify-center`}
    >
      {isKing && <span className="text-yellow-400 font-bold text-xs">♔</span>}
    </div>
  );
};

export default Piece;
