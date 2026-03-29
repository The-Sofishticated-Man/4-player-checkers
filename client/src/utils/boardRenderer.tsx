import type { BoardState } from "../../../shared/types/gameTypes";
import Cell from "../components/Cell";
import Piece from "../components/Piece";

export const generateBoardCells = (
  boardState: BoardState,
  validMoves: { row: number; col: number; isCapture: boolean }[],
  draggedPieceOwner: number | null,
  currentPlayer: number,
  playerIndex: number,
  gameStarted: boolean = false,
) => {
  const cells = [];
  const boardSize = boardState.length;

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      // Alternate color: true for dark, false for light
      const isDark = (row + col) % 2 === 1;

      // Check if this cell is a valid move
      const validMove = validMoves.find(
        (move) => move.row === row && move.col === col,
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
          {boardState[row][col] !== 0 && (
            <Piece
              pieceID={`piece-${row}-${col}`}
              player={boardState[row][col]}
              disabled={
                !gameStarted || // Game hasn't started yet
                currentPlayer !== playerIndex || // Not player's turn
                (boardState[row][col] >= 10
                  ? Math.floor(boardState[row][col] / 10) !== playerIndex // King doesn't belong to player
                  : boardState[row][col] !== playerIndex) // Regular piece doesn't belong to player
              }
            />
          )}
        </Cell>,
      );
    }
  }

  return cells;
};
