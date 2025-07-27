import type { checkersBoardState } from "../types/boardTypes";

// Import piece utilities - avoiding circular dependencies
function isKing(piece: number): boolean {
  return piece >= 10; // Kings are 10, 20, 30, 40 (player * 10)
}

function getPlayerFromPiece(piece: number): number {
  if (piece === 0) return 0; // Empty
  if (piece >= 10) return Math.floor(piece / 10); // Kings: 10->1, 20->2, 30->3, 40->4
  return piece; // Regular pieces: 1, 2, 3, 4
}

function isOccupied(
  board: checkersBoardState,
  row: number,
  col: number
): boolean {
  // Check if the specified position is occupied
  return board[row][col] !== 0;
}

export function isValidCaptureForPlayer(
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
