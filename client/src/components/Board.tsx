import Cell from "./Cell";
import Piece from "./Piece";
const Board = () => {
  // Generate an 8x8 chessboard
  const cells = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      // Alternate color: true for dark, false for light
      const isDark = (row + col) % 2 === 1;
      cells.push(<Cell key={`${row}-${col}`} row={row} column={col} isDark={isDark}>{row ==5 && <Piece pieceID={`${row}-${col}`} player={1} /> }</Cell>);
    }
  }
  return (
    <div>
      <div className="grid grid-cols-8 w-fit border-4 border-black ">{cells}</div>
    </div>
  );
};

export default Board;
