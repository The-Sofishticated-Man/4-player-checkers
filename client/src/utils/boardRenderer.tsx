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
  allowMoveAnyPiece: boolean = false,
  selectedPiece: { row: number; col: number } | null = null,
  onPieceClick: (row: number, col: number) => void = () => {},
  onCellClick: (row: number, col: number) => void = () => {},
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
      const isSelectedPiece =
        selectedPiece?.row === row && selectedPiece.col === col;
      const pieceValue = boardState[row][col];
      const isPieceDisabled =
        !gameStarted ||
        (!allowMoveAnyPiece &&
          (currentPlayer !== playerIndex ||
            (pieceValue >= 10
              ? Math.floor(pieceValue / 10) !== playerIndex
              : pieceValue !== playerIndex)));

      cells.push(
        <Cell
          key={`${row}-${col}`}
          row={row}
          column={col}
          isDark={isDark}
          isValidMove={isValidMove}
          isValidCapture={isValidCapture}
          draggedPieceOwner={draggedPieceOwner}
          onClick={() => onCellClick(row, col)}
        >
          {pieceValue !== 0 && (
            <Piece
              pieceID={`piece-${row}-${col}`}
              player={pieceValue}
              disabled={isPieceDisabled}
              isSelected={isSelectedPiece}
              onClick={() => onPieceClick(row, col)}
            />
          )}
        </Cell>,
      );
    }
  }

  return cells;
};
