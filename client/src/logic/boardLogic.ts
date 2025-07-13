import type { checkersBoardState } from "../types/boardTypes";

function PositionChanged(
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
): boolean {
  // Check if the position has changed
  return fromRow !== toRow || fromCol !== toCol;
}

function isOccupied(
  board: checkersBoardState,
  row: number,
  col: number
): boolean {
  // Check if the specified position is occupied
  return board[row][col] !== 0;
}

function isValidDiagonalMoveForPlayer(
  board: checkersBoardState,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
) {
  const player = board[fromRow][fromCol];
  switch (player) {
    case 1:
      return toRow - fromRow === 1 && Math.abs(fromCol - toCol) === 1;
    case 2:
      return fromRow - toRow === 1 && Math.abs(fromCol - toCol) === 1;
    default:
      return false;
  }
}
function isValidCaptureForPlayer(
  board: checkersBoardState,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
) {
  const player = board[fromRow][fromCol];

  // Check if it's a 2-square diagonal move (capture move)
  if (Math.abs(fromRow - toRow) !== 2 || Math.abs(fromCol - toCol) !== 2) {
    return false;
  }

  // Calculate the middle position (the piece being captured)
  const middleRow = (fromRow + toRow) / 2;
  const middleCol = (fromCol + toCol) / 2;

  // Check bounds for the middle position
  if (
    middleRow < 0 ||
    middleRow >= board.length ||
    middleCol < 0 ||
    middleCol >= board[0].length
  ) {
    return false;
  }

  const middlePiece = board[middleRow][middleCol];

  // Check if there's an opponent piece to capture
  if (middlePiece === 0 || middlePiece === player) {
    return false; // No piece to capture or it's our own piece
  }

  switch (player) {
    case 1: // Red player moves down (increasing row numbers)
      // Can capture diagonally down (toRow > fromRow)
      return toRow - fromRow === 2;

    case 2: // Blue player moves up (decreasing row numbers)
      // Can capture diagonally up (toRow < fromRow)
      return fromRow - toRow === 2;

    default:
      return false;
  }
}

function moveIsOutOfBounds(
  board: checkersBoardState,
  toRow: number,
  toCol: number
) {
  // Return true if the move IS out of bounds
  return (
    toRow < 0 || toRow >= board.length || toCol < 0 || toCol >= board[0].length
  );
}

export function isCapture(
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
): boolean {
  // A capture is a 2-square diagonal move
  return Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 2;
}

export function getCapturedPosition(
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
): { capturedRow: number; capturedCol: number } {
  return {
    capturedRow: (fromRow + toRow) / 2,
    capturedCol: (fromCol + toCol) / 2,
  };
}
export function isPlayersTurn(
  board: checkersBoardState,
  fromRow: number,
  fromCol: number,
  currentPlayer: number
): boolean {
  // Check if the piece belongs to the current player
  const piece = board[fromRow][fromCol];
  return piece === currentPlayer;
}

export default function isValidMove(
  board: checkersBoardState,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
): boolean {
  // Check if move is out of bounds
  if (moveIsOutOfBounds(board, toRow, toCol)) {
    return false;
  }

  // Check if position actually changed
  if (!PositionChanged(fromRow, fromCol, toRow, toCol)) {
    return false;
  }

  // Check if destination is occupied
  if (isOccupied(board, toRow, toCol)) {
    return false;
  }

  // Check if it's a valid diagonal move (1 square)
  if (isValidDiagonalMoveForPlayer(board, fromRow, fromCol, toRow, toCol)) {
    return true;
  }

  // Check if it's a valid capture move (2 squares)
  if (isValidCaptureForPlayer(board, fromRow, fromCol, toRow, toCol)) {
    return true;
  }

  return false;
}
