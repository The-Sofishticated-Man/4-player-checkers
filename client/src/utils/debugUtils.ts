
export function printBoard(
  boardState: number[][],
): void {
  console.log("Board State:");
  
  for (const row of boardState) {
    let rowString = "";
    for (const cell of row) {
      rowString += (cell === -1 ? "9" : cell) + " "; // Use '9' for empty cells
    }
    console.log(rowString.trim());
  }

}