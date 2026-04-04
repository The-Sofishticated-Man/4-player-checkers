import type { BoardState } from "../../../shared/types/gameTypes";
import Cell from "../components/Cell";
import Piece from "../components/Piece";
import {
  getBoardRotationForPlayer,
  visualToLogicalPosition,
} from "./boardOrientation";

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
  const boardRotation = getBoardRotationForPlayer(playerIndex);

  for (let visualRow = 0; visualRow < boardSize; visualRow++) {
    for (let visualCol = 0; visualCol < boardSize; visualCol++) {
      const { row, col } = visualToLogicalPosition(
        visualRow,
        visualCol,
        boardSize,
        boardRotation,
      );

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
          key={`${visualRow}-${visualCol}`}
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
