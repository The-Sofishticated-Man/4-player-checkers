import type { checkersBoardState } from "../types/boardTypes";
import Cell from "../components/Cell";
import Piece from "../components/Piece";

export const generateBoardCells = (
  checkersBoardState: checkersBoardState,
  validMoves: { row: number; col: number; isCapture: boolean }[],
  draggedPieceOwner: number | null
) => {
  const cells = [];
  const boardSize = checkersBoardState.length;

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      // Alternate color: true for dark, false for light
      const isDark = (row + col) % 2 === 1;

      // Check if this cell is a valid move
      const validMove = validMoves.find(
        (move) => move.row === row && move.col === col
      );
      const isValidMove = !!validMove && !validMove.isCapture;
      const isValidCapture = !!validMove && validMove.isCapture;

      cells.push(
        <Cell
          key={`${row}-${col}`}
          row={row}
          column={col}
          isDark={isDark}
          isValidMove={isValidMove}
          isValidCapture={isValidCapture}
          draggedPieceOwner={draggedPieceOwner}
        >
          {checkersBoardState[row][col] !== 0 && (
            <Piece
              pieceID={`piece-${row}-${col}`}
              player={checkersBoardState[row][col]}
            />
          )}
        </Cell>
      );
    }
  }

  return cells;
};
