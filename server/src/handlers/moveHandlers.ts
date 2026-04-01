import { Socket } from "socket.io";
import { Game } from "../models/Game.ts";
import { Board } from "../../../shared/logic/boardModel.ts";
import type {
  BoardState,
  MoveCoordinates,
  PlayerIndex,
} from "../../../shared/types/gameTypes.ts";
import { SANDBOX_MODE } from "../utils/devSandbox.ts";

interface MoveParams extends MoveCoordinates {
  roomID: string;
}

interface DebugSetStateParams {
  roomID: string;
  boardState?: BoardState;
  currentPlayer?: PlayerIndex;
  gameStarted?: boolean;
}

export class MoveHandlers {
  constructor(
    private socket: Socket,
    private games: Map<string, Game>,
  ) {}

  private emitGameStateUpdate(roomID: string, game: Game): void {
    const payload = {
      boardState: game.gameState.boardState,
      currentPlayer: game.gameState.currentPlayer,
      gameStarted: game.gameStarted,
    };

    this.socket.to(roomID).emit("move-made", payload);
    this.socket.emit("move-made", payload);
  }

  handleMakeMove = ({ roomID, fromRow, toRow, fromCol, toCol }: MoveParams) => {
    const move: MoveCoordinates = {
      fromRow,
      fromCol,
      toRow,
      toCol,
    };

    // grab game
    const game = this.games.get(roomID);

    if (!game) {
      console.error(`Game not found for room: ${roomID}`);
      this.socket.emit("move-error", "Game not found");
      return;
    }

    const currentPlayerId = this.socket.data.playerId as string | undefined;
    if (!currentPlayerId) {
      console.error(`Socket ID ${this.socket.id} not found in game state`);
      this.socket.emit("move-error", "Player not found");
      return;
    }

    console.log(
      `🚀 Move attempt - Room: ${roomID}, Player: ${currentPlayerId}, Move: (${fromRow},${fromCol}) → (${toRow},${toCol})`,
    );
    console.log("current board state:");
    for (const row of game.gameState.boardState) {
      console.log(row.join(" "));
    }

    // Check if the game has started
    if (!SANDBOX_MODE && !game.gameStarted) {
      this.socket.emit(
        "move-error",
        "Game hasn't started yet - waiting for all 4 players to join",
      );
      return;
    }

    // Check if it's the current player's turn
    const playerIndex = game.getPlayerIndexFromId(currentPlayerId);
    if (!SANDBOX_MODE && game.gameState.currentPlayer !== playerIndex) {
      this.socket.emit("move-error", "It's not your turn");
      return;
    }

    // Validate that the piece belongs to the current player
    const board = new Board(game.gameState.boardState);

    if (
      !SANDBOX_MODE &&
      !board.isPlayersTurn(fromRow, fromCol, game.gameState.currentPlayer)
    ) {
      this.socket.emit("move-error", "You can only move your own pieces");
      return;
    }

    // Check if this is a capture move (2 squares diagonally)
    const isCapture = Board.isCapture(
      move.fromRow,
      move.fromCol,
      move.toRow,
      move.toCol,
    );

    if (isCapture) {
      // Validate capture move
      if (
        !SANDBOX_MODE &&
        !board.isValidCaptureForPlayer(fromRow, fromCol, toRow, toCol)
      ) {
        this.socket.emit("move-error", "Invalid capture move");
        return;
      }
    } else {
      // Validate regular move
      if (!SANDBOX_MODE && !board.isValidMove(fromRow, fromCol, toRow, toCol)) {
        this.socket.emit("move-error", "Invalid move");
        return;
      }
    }

    const moveResult = board.applyMove(move);

    // Update game state
    game.gameState.boardState = moveResult.newBoard;

    if (moveResult.shouldChangePlayer) {
      game.gameState.currentPlayer = Board.getNextPlayer(
        game.gameState.currentPlayer,
      );
    }

    // Emit new game state to all players in the room (exactly once)
    this.emitGameStateUpdate(roomID, game);
    console.log(
      `✅ Move completed - Room: ${roomID}, Player: ${currentPlayerId}, New turn: Player ${game.gameState.currentPlayer}`,
    );
    console.log("new board state:");
    for (const row of game.gameState.boardState) {
      console.log(row.join(" "));
    }
  };

  handleDebugSetState = ({
    roomID,
    boardState,
    currentPlayer,
    gameStarted,
  }: DebugSetStateParams) => {
    if (!SANDBOX_MODE) {
      this.socket.emit("move-error", "Sandbox mode is disabled on the server");
      return;
    }

    const game = this.games.get(roomID);
    if (!game) {
      this.socket.emit("move-error", "Game not found");
      return;
    }

    if (boardState) {
      game.gameState.boardState = boardState.map((row) => [...row]);
    }

    if (currentPlayer) {
      game.gameState.currentPlayer = currentPlayer;
    }

    if (typeof gameStarted === "boolean") {
      game.gameStarted = gameStarted;
      game.gameState.gameStarted = gameStarted;
    }

    this.emitGameStateUpdate(roomID, game);
  };
}
