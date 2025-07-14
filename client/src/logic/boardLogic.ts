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
function isValidCaptureForPlayer(
  board: checkersBoardState,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
) {
  const piece = board[fromRow][fromCol];
  const player = getPlayerFromPiece(piece);

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
    middleCol >= board[0].length ||
    board[middleRow][middleCol] === -1 // Check if middle position is inaccessible
  ) {
    return false;
  }

  const middlePiece = board[middleRow][middleCol];
  const middlePlayer = getPlayerFromPiece(middlePiece);

  // Check if there's an opponent piece to capture
  if (middlePiece === 0 || middlePlayer === player) {
    return false; // No piece to capture or it's our own piece
  }

  // Kings can capture in any diagonal direction
  if (isKing(piece)) {
    return true;
  }

  // Regular pieces have direction restrictions for captures
  switch (player) {
    case 1: // Player 1 moves up (decreasing row numbers)
      // Can capture diagonally up (toRow < fromRow)
      return fromRow - toRow === 2;

    case 2: // Player 2 moves right (increasing col numbers)
      // Can capture diagonally right (toCol > fromCol)
      return toCol - fromCol === 2;

    case 3: // Player 3 moves down (increasing row numbers)
      // Can capture diagonally down (toRow > fromRow)
      return toRow - fromRow === 2;

    case 4: // Player 4 moves left (decreasing col numbers)
      // Can capture diagonally left (toCol < fromCol)
      return fromCol - toCol === 2;

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
  const piecePlayer = getPlayerFromPiece(piece);
  return piecePlayer === currentPlayer;
}

export function hasValidCapture(
  board: checkersBoardState,
  fromRow: number,
  fromCol: number
): boolean {
  // Check all four diagonal directions for potential captures
  const directions = [
    [-2, -2], // up-left
    [-2, 2], // up-right
    [2, -2], // down-left
    [2, 2], // down-right
  ];

  for (const [rowOffset, colOffset] of directions) {
    const toRow = fromRow + rowOffset;
    const toCol = fromCol + colOffset;

    // Check if the destination is within bounds
    if (
      toRow >= 0 &&
      toRow < board.length &&
      toCol >= 0 &&
      toCol < board[0].length
    ) {
      // Check if this would be a valid capture move
      if (
        isValidCaptureForPlayer(board, fromRow, fromCol, toRow, toCol) &&
        !isOccupied(board, toRow, toCol)
      ) {
        return true;
      }
    }
  }

  return false;
}

function isKing(piece: number): boolean {
  return piece >= 10; // Kings are 10, 20, 30, 40 (player * 10)
}

function getPlayerFromPiece(piece: number): number {
  if (piece === 0) return 0; // Empty
  if (piece >= 10) return Math.floor(piece / 10); // Kings: 10->1, 20->2, 30->3, 40->4
  return piece; // Regular pieces: 1, 2, 3, 4
}

export function shouldPromoteToKing(
  piece: number,
  toRow: number,
  toCol: number,
  boardSize: number
): boolean {
  // Only regular pieces can be promoted (not already kings)
  if (piece >= 10) return false;

  // Player 1 pieces promote when reaching top row (row 0)
  if (piece === 1 && toRow === 0) return true;
  // Player 2 pieces promote when reaching right edge (col = boardSize - 1)
  if (piece === 2 && toCol === boardSize - 1) return true;
  // Player 3 pieces promote when reaching bottom row (row = boardSize - 1)
  if (piece === 3 && toRow === boardSize - 1) return true;
  // Player 4 pieces promote when reaching left edge (col = 0)
  if (piece === 4 && toCol === 0) return true;

  return false;
}

export function promoteToKing(piece: number): number {
  if (piece >= 10) return piece; // Already a king
  return piece * 10; // Convert to king: 1->10, 2->20, 3->30, 4->40
}

export function getValidMoves(
  board: checkersBoardState,
  fromRow: number,
  fromCol: number
): { row: number; col: number; isCapture: boolean }[] {
  const validMoves: { row: number; col: number; isCapture: boolean }[] = [];

  // Check all possible moves in a reasonable range
  for (let toRow = 0; toRow < board.length; toRow++) {
    for (let toCol = 0; toCol < board[0].length; toCol++) {
      if (isValidMove(board, fromRow, fromCol, toRow, toCol)) {
        const isCapture =
          Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 2;
        validMoves.push({ row: toRow, col: toCol, isCapture });
      }
    }
  }

  return validMoves;
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
