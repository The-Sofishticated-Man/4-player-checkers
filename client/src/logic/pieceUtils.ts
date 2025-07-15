export function isKing(piece: number): boolean {
  return piece >= 10; // Kings are 10, 20, 30, 40 (player * 10)
}

export function getPlayerFromPiece(piece: number): number {
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
