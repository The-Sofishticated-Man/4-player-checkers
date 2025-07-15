import type { checkersBoardState } from "../types/boardTypes";

// Import piece utilities - these functions will be defined in pieceUtils.ts
function isKing(piece: number): boolean {
  return piece >= 10; // Kings are 10, 20, 30, 40 (player * 10)
}

function getPlayerFromPiece(piece: number): number {
  if (piece === 0) return 0; // Empty
  if (piece >= 10) return Math.floor(piece / 10); // Kings: 10->1, 20->2, 30->3, 40->4
  return piece; // Regular pieces: 1, 2, 3, 4
}

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
  const piece = board[fromRow][fromCol];
  const player = getPlayerFromPiece(piece);

  // Kings can move in any diagonal direction
  if (isKing(piece)) {
    return Math.abs(fromRow - toRow) === 1 && Math.abs(fromCol - toCol) === 1;
  }

  // Regular pieces have direction restrictions
  switch (player) {
    case 1: // Player 1 moves up (decreasing row numbers)
      return fromRow - toRow === 1 && Math.abs(fromCol - toCol) === 1;
    case 2: // Player 2 moves right (increasing col numbers)
      return Math.abs(fromRow - toRow) === 1 && toCol - fromCol === 1;
    case 3: // Player 3 moves down (increasing row numbers)
      return toRow - fromRow === 1 && Math.abs(fromCol - toCol) === 1;
    case 4: // Player 4 moves left (decreasing col numbers)
      return Math.abs(fromRow - toRow) === 1 && fromCol - toCol === 1;
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
    toRow < 0 || // Out of upper bounds
    toRow >= board.length || // Out of lower bounds
    toCol < 0 || // Out of left bounds
    toCol >= board[0].length || // Out of right bounds
    board[toRow][toCol] == -1 // Out of bounds for non-square boards
  );
}

export function isPlayersTurn(
  board: checkersBoardState,
  fromRow: number,
  fromCol: number,
  currentPlayer: number
): boolean {
  // Check if the piece belongs to the current player
  const piece = board[fromRow][fromCol];
  const piecePlayer = getPlayerFromPiece(piece);
  return piecePlayer === currentPlayer;
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

  return false;
}

export {
  isValidDiagonalMoveForPlayer,
  moveIsOutOfBounds,
  isOccupied,
  PositionChanged,
};
