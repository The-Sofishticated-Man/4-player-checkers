import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
const Piece = ({ pieceID, player }: { pieceID: string; player: number }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: pieceID,
  });
  const style = {
    transform: CSS.Translate.toString(transform),
  };
  const playerColor = player === 1 ? "bg-red-500" : "bg-black-500";
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${playerColor} w-10 h-10 rounded-full mx-auto my-auto aspect-square cursor-pointer`}
    ></div>
  );
};

export default Piece;
