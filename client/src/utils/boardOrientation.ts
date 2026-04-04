export type BoardRotation = 0 | 90 | 180 | 270;

export const getBoardRotationForPlayer = (
  playerIndex: number,
): BoardRotation => {
  switch (playerIndex) {
    case 2:
      return 270;
    case 3:
      return 180;
    case 4:
      return 90;
    case 1:
    default:
      return 0;
  }
};

export const visualToLogicalPosition = (
  visualRow: number,
  visualCol: number,
  boardSize: number,
  rotation: BoardRotation,
) => {
  switch (rotation) {
    case 90:
      return {
        row: boardSize - 1 - visualCol,
        col: visualRow,
      };
    case 180:
      return {
        row: boardSize - 1 - visualRow,
        col: boardSize - 1 - visualCol,
      };
    case 270:
      return {
        row: visualCol,
        col: boardSize - 1 - visualRow,
      };
    case 0:
    default:
      return {
        row: visualRow,
        col: visualCol,
      };
  }
};
