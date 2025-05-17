board = [
  [0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [2, 0, 2, 0, 2, 0, 2, 0],
  [0, 2, 0, 2, 0, 2, 0, 2],
  [2, 0, 2, 0, 2, 0, 2, 0],
];

window.onload = () => {
  const cells = Array.from(document.getElementsByClassName("cell"));
  cells.forEach((cell) => {
    let piece = document.createElement("div");
    piece.classList.add("piece")
    i = cell.getAttribute("data-i");
    j = cell.getAttribute("data-j");
    state = board[i][j];
    if (state == 1) {
      piece.classList.add("one");
      cell.appendChild(piece);
    } else if (state == 2) {
      piece.classList.add("two");
      cell.appendChild(piece);
    }
  });
};
