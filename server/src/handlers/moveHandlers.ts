import { Socket } from "socket.io";
import { type gameState } from "../../../shared/types/gameTypes.ts";
import isValidMove, {
  isPlayersTurn,
} from "../../../shared/logic/movementValidation.ts";
import {
  isValidCaptureForPlayer,
  hasValidCapture,
} from "../../../shared/logic/captureLogic.ts";
import {
  shouldPromoteToKing,
  promoteToKing,
} from "../../../shared/logic/pieceUtils.ts";

export const setupMoveHandlers = (
  socket: Socket,
  games: Map<string, gameState>
) => {
  socket.on("make-move", ({ roomID, fromRow, toRow, fromCol, toCol }) => {
    const game = games.get(roomID);
    if (!game) {
      console.error(`Game not found for room: ${roomID}`);
      socket.emit("move-error", "Game not found");
      return;
    }

    const currentPlayerId = game.socketToPlayer.get(socket.id);
    if (!currentPlayerId) {
      console.error(`Socket ID ${socket.id} not found in game state`);
      socket.emit("move-error", "Player not found");
      return;
    }

    console.log(
      `🚀 Move attempt - Room: ${roomID}, Player: ${currentPlayerId}, Move: (${fromRow},${fromCol}) → (${toRow},${toCol})`
    );
    console.log("current board state:");
    for (const row of game.boardState) {
      console.log(row.join(" "));
    }
    // Check if it's the current player's turn
    const playerIndex = game.players.indexOf(currentPlayerId) + 1;
    if (game.currentPlayer !== playerIndex) {
      socket.emit("move-error", "It's not your turn");
      return;
    }

    // Validate that the piece belongs to the current player
    if (!isPlayersTurn(game.boardState, fromRow, fromCol, game.currentPlayer)) {
      socket.emit("move-error", "You can only move your own pieces");
      return;
    }

    // Check if this is a capture move (2 squares diagonally)
    const isCapture =
      Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 2;

    if (isCapture) {
      // Validate capture move
      if (
        !isValidCaptureForPlayer(
          game.boardState,
          fromRow,
          fromCol,
          toRow,
          toCol
        )
      ) {
        socket.emit("move-error", "Invalid capture move");
        return;
      }

      // Calculate captured piece position
      const capturedRow = (fromRow + toRow) / 2;
      const capturedCol = (fromCol + toCol) / 2;

      // Execute the capture
      const newBoard = game.boardState.map((row) => [...row]);
      let piece = newBoard[fromRow][fromCol];

      // Move piece
      newBoard[fromRow][fromCol] = 0;
      newBoard[capturedRow][capturedCol] = 0; // Remove captured piece

      // Check for king promotion
      if (shouldPromoteToKing(piece, toRow, toCol, newBoard.length)) {
        piece = promoteToKing(piece);
      }

      newBoard[toRow][toCol] = piece;

      // Update game state
      game.boardState = newBoard;

      // Check if the same piece has another valid capture
      const hasMoreCaptures = hasValidCapture(newBoard, toRow, toCol);

      // Only change player if no more captures available
      if (!hasMoreCaptures) {
        game.currentPlayer = ((game.currentPlayer % 4) + 1) as 1 | 2 | 3 | 4;
      }

      // Emit new game state to all players in the room
      socket.to(roomID).emit("move-made", {
        boardState: newBoard,
        currentPlayer: game.currentPlayer,
      });

      // Also emit to the player who made the move
      socket.emit("move-made", {
        boardState: newBoard,
        currentPlayer: game.currentPlayer,
      });
    } else {
      // Validate regular move
      if (!isValidMove(game.boardState, fromRow, fromCol, toRow, toCol)) {
        socket.emit("move-error", "Invalid move");
        return;
      }

      // Execute the regular move
      const newBoard = game.boardState.map((row) => [...row]);
      let piece = newBoard[fromRow][fromCol];

      // Move piece
      newBoard[fromRow][fromCol] = 0;

      // Check for king promotion
      if (shouldPromoteToKing(piece, toRow, toCol, newBoard.length)) {
        piece = promoteToKing(piece);
      }

      newBoard[toRow][toCol] = piece;

      // Update game state
      game.boardState = newBoard;
      game.currentPlayer = ((game.currentPlayer % 4) + 1) as 1 | 2 | 3 | 4;

      // Emit new game state to all players in the room
      socket.to(roomID).emit("move-made", {
        boardState: newBoard,
        currentPlayer: game.currentPlayer,
      });

      // Also emit to the player who made the move
      socket.emit("move-made", {
        newBoardState: newBoard,
        nextPlayer: game.currentPlayer,
      });
    }
    console.log(
      `✅ Move completed - Room: ${roomID}, Player: ${currentPlayerId}, New turn: Player ${game.currentPlayer}`
    );
    console.log("new board state:");
    for (const row of game.boardState) {
      console.log(row.join(" "));
    }
  });

  // Handle request for current game state
  socket.on("get-game-state", (roomID) => {
    const game = games.get(roomID);
    if (!game) {
      socket.emit("game-state-error", "Game not found");
      return;
    }

    const currentPlayerId = game.socketToPlayer.get(socket.id);
    if (!currentPlayerId) {
      socket.emit("game-state-error", "Player not found");
      return;
    }

    socket.emit("game-state", {
      boardState: game.boardState,
      currentPlayer: game.currentPlayer,
      players: game.players,
      playerId: currentPlayerId,
    });
  });
};
