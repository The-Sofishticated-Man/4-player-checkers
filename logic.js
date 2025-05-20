"use strict";
const initialBoard = [
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 2, 0, 2, 0, 2, 0],
    [0, 2, 0, 2, 0, 2, 0, 2],
    [2, 0, 2, 0, 2, 0, 2, 0],
];
class Cell {
    constructor(cell, row, col) {
        this.player = 0;
        this.piece = null;
        this.isSelected = false;
        this.row = row;
        this.col = col;
        this.cell = cell;
        // set the cell's data attributes
        this.player = initialBoard[this.row][this.col];
        // if the cell is initially occupied, set the piece
        if (this.isOccupied)
            this.setPiece(createPieceElement(this.player));
    }
    get isOccupied() {
        return this.player !== 0;
    }
    setPlayer(value) {
        this.player = value;
    }
    getPiece() {
        return this.piece;
    }
    removePiece() {
        if (this.piece != null) {
            Cell.board[this.row][this.col].setPlayer(0);
            this.piece = null;
        }
    }
    setPiece(piece) {
        this.piece = piece;
        if (this.piece != null) {
            console.log("piece: ", this.piece);
            this.cell.appendChild(this.piece);
            this.piece.addEventListener("dragstart", (e) => {
                var _a, _b;
                (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.setData("i", String(this.row));
                (_b = e.dataTransfer) === null || _b === void 0 ? void 0 : _b.setData("j", String(this.col));
                this.piece.classList.add("dragging");
            });
            this.piece.addEventListener("dragend", (e) => {
                this.piece.classList.remove("dragging");
            });
        }
    }
    playMove(piece, i, j) {
        // piece: the piece being placed in this cell from start cell
        // i, j: the cooridinates of the cell from which the piece is being dragged
        //this: destination cell
        let startCell = Cell.board[i][j];
        if (!this.isOccupied && startCell != this) {
            this.setPiece(piece);
            startCell.removePiece();
            this.setPlayer(startCell.player);
        }
    }
}
function createPieceElement(player) {
    const pieceElement = document.createElement("div");
    pieceElement.classList.add("piece");
    pieceElement.classList.add(player == 1 ? "one" : "two");
    pieceElement.setAttribute("draggable", "true");
    return pieceElement;
}
function setupCellEventListeners(cellObject) {
    cellObject.cell.addEventListener("dragover", (e) => {
        e.preventDefault();
    });
    //handle the piece drop event
    cellObject.cell.addEventListener("drop", (event) => {
        var _a, _b;
        let e = event;
        e.preventDefault();
        const draggedPiece = document.querySelector(".dragging");
        let i = Number((_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.getData("i"));
        let j = Number((_b = e.dataTransfer) === null || _b === void 0 ? void 0 : _b.getData("j"));
        cellObject.playMove(draggedPiece, i, j);
    });
}
function initializeCells() {
    const cells = Array.from(document.getElementsByClassName("cell"));
    const board = [];
    for (const cell of cells) {
        const row = Number(cell.dataset.i);
        const col = Number(cell.dataset.j);
        const cellObject = new Cell(cell, row, col);
        setupCellEventListeners(cellObject);
        if (!board[row]) {
            board[row] = [];
        }
        board[row][col] = cellObject;
    }
    Cell.board = board;
}
initializeCells();
