export function PositionChanged(
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
): boolean {
  // Check if the position has changed
  return fromRow !== toRow || fromCol !== toCol;
}


