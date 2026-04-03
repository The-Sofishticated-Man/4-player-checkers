import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";
import initialState from "../../../server/src/utils/initialGameState";
import type {
  BoardState,
  PlayerIndex,
  SerializedGameState,
} from "../../../shared/types/gameTypes";

interface DevSandboxPanelProps {
  roomId: string;
  allowMoveAnyPiece: boolean;
  onToggleMoveAnyPiece: (allow: boolean) => void;
}

interface DebugSetStatePayload {
  roomID: string;
  boardState?: BoardState;
  currentPlayer?: PlayerIndex;
  gameStarted?: boolean;
}

type StatusKind = "info" | "success" | "error";

interface SandboxStatus {
  kind: StatusKind;
  message: string;
}

interface SandboxRoomSnapshot {
  roomID: string;
  playerCount: number;
  connectedPlayerCount: number;
  gameState: SerializedGameState;
}

const cloneBoard = (board: BoardState): BoardState =>
  board.map((row) => [...row]);

const createEmptyPlayableBoard = (board: BoardState): BoardState =>
  board.map((row) => row.map((cell) => (cell === -1 ? -1 : 0)));

const createCaptureChainBoard = (): BoardState => {
  const board = createEmptyPlayableBoard(initialState.boardState);

  board[8][4] = 1;
  board[7][5] = 2;
  board[5][7] = 2;

  return board;
};

const createKingPromotionBoard = (): BoardState => {
  const board = createEmptyPlayableBoard(initialState.boardState);

  board[1][3] = 1;

  return board;
};

const createOneMoveToWinBoard = (): BoardState => {
  const board = createEmptyPlayableBoard(initialState.boardState);

  // Player 1 can capture player 2 in one move to end the game.
  board[8][4] = 1;
  board[7][5] = 2;

  return board;
};

const createPlayerOneWinsBoard = (): BoardState => {
  const board = createEmptyPlayableBoard(initialState.boardState);

  board[8][4] = 1;

  return board;
};

const createForcedDrawBoard = (): BoardState =>
  createEmptyPlayableBoard(initialState.boardState);

function DevSandboxPanel({
  roomId,
  allowMoveAnyPiece,
  onToggleMoveAnyPiece,
}: DevSandboxPanelProps) {
  const { socket, isConnected } = useSocket();
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [status, setStatus] = useState<SandboxStatus>({
    kind: "info",
    message: "Ready",
  });
  const [snapshot, setSnapshot] = useState<SandboxRoomSnapshot | null>(null);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleMoveError = (message: string) => {
      setStatus({
        kind: "error",
        message: pendingAction
          ? `${pendingAction} failed: ${message}`
          : `Server error: ${message}`,
      });
      setPendingAction(null);
    };

    const handleSandboxError = (message: string) => {
      setStatus({
        kind: "error",
        message: pendingAction
          ? `${pendingAction} failed: ${message}`
          : `Sandbox error: ${message}`,
      });
      setPendingAction(null);
    };

    const handleSandboxStateApplied = () => {
      if (!pendingAction) {
        return;
      }

      setStatus({
        kind: "success",
        message: `${pendingAction} applied`,
      });
      setPendingAction(null);
    };

    const handleSandboxRoomState = (payload: SandboxRoomSnapshot) => {
      if (payload.roomID !== roomId) {
        return;
      }

      setSnapshot(payload);
    };

    const handleMoveMade = () => {
      if (!pendingAction) {
        return;
      }

      setStatus({
        kind: "success",
        message: `${pendingAction} applied`,
      });
      setPendingAction(null);
    };

    socket.on("move-error", handleMoveError);
    socket.on("sandbox-error", handleSandboxError);
    socket.on("sandbox-state-applied", handleSandboxStateApplied);
    socket.on("sandbox-room-state", handleSandboxRoomState);
    socket.on("move-made", handleMoveMade);

    return () => {
      socket.off("move-error", handleMoveError);
      socket.off("sandbox-error", handleSandboxError);
      socket.off("sandbox-state-applied", handleSandboxStateApplied);
      socket.off("sandbox-room-state", handleSandboxRoomState);
      socket.off("move-made", handleMoveMade);
    };
  }, [socket, pendingAction, roomId]);

  useEffect(() => {
    if (!socket || !isConnected) {
      return;
    }

    socket.emit("sandbox-get-room-state", { roomID: roomId });
  }, [socket, isConnected, roomId]);

  if (!import.meta.env.DEV) {
    return null;
  }

  const emitDebugState = (
    actionLabel: string,
    payload: Omit<DebugSetStatePayload, "roomID">,
  ) => {
    if (!socket || !isConnected) {
      setStatus({
        kind: "error",
        message: "Socket disconnected: unable to send sandbox action",
      });
      return;
    }

    setPendingAction(actionLabel);
    setStatus({ kind: "info", message: `${actionLabel} sent...` });

    socket.emit("sandbox-set-state", {
      roomID: roomId,
      ...payload,
    } satisfies DebugSetStatePayload);
  };

  const handleToggleMoveAnyPiece = () => {
    const nextValue = !allowMoveAnyPiece;
    onToggleMoveAnyPiece(nextValue);
    setStatus({
      kind: "success",
      message: `Move any piece ${nextValue ? "enabled" : "disabled"}`,
    });
  };

  const statusClassName =
    status.kind === "success"
      ? "border-green-300 bg-green-50 text-green-800"
      : status.kind === "error"
        ? "border-red-300 bg-red-50 text-red-800"
        : "border-orange-300 bg-orange-50 text-orange-800";

  return (
    <div className="fixed bottom-4 left-4 z-50 rounded-xl border border-orange-300 bg-orange-50 p-3 shadow-lg">
      <p className="text-sm font-semibold text-orange-800">Dev Sandbox</p>
      <p className="mb-1 text-xs text-orange-700">
        Runs only in Vite dev. Requires CHECKERS_SANDBOX=true on server.
      </p>
      <p className="mb-2 text-xs text-orange-700">
        Socket: {isConnected ? "Connected" : "Disconnected"}
      </p>
      <p className="mb-2 text-xs text-orange-700">
        Players: {snapshot?.connectedPlayerCount ?? 0}/
        {snapshot?.playerCount ?? 0} connected
      </p>

      <div className="mb-2 flex flex-wrap gap-2">
        <button
          className={`rounded px-2 py-1 text-xs font-semibold text-white ${
            allowMoveAnyPiece ? "bg-emerald-700" : "bg-slate-700"
          }`}
          onClick={handleToggleMoveAnyPiece}
          type="button"
        >
          {allowMoveAnyPiece ? "Move Any Piece: ON" : "Move Any Piece: OFF"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          className="rounded bg-orange-600 px-2 py-1 text-xs font-semibold text-white"
          onClick={() => emitDebugState("Force Start", { gameStarted: true })}
          type="button"
        >
          Force Start
        </button>

        <button
          className="rounded bg-gray-700 px-2 py-1 text-xs font-semibold text-white"
          onClick={() =>
            emitDebugState("Reset Board", {
              boardState: cloneBoard(initialState.boardState),
              currentPlayer: 1,
              gameStarted: true,
            })
          }
          type="button"
        >
          Reset Board
        </button>

        <button
          className="rounded bg-emerald-700 px-2 py-1 text-xs font-semibold text-white"
          onClick={() =>
            emitDebugState("Capture Chain", {
              boardState: createCaptureChainBoard(),
              currentPlayer: 1,
              gameStarted: true,
            })
          }
          type="button"
        >
          Capture Chain
        </button>

        <button
          className="rounded bg-indigo-700 px-2 py-1 text-xs font-semibold text-white"
          onClick={() =>
            emitDebugState("King Test", {
              boardState: createKingPromotionBoard(),
              currentPlayer: 1,
              gameStarted: true,
            })
          }
          type="button"
        >
          King Test
        </button>

        <button
          className="rounded bg-rose-700 px-2 py-1 text-xs font-semibold text-white"
          onClick={() =>
            emitDebugState("One Move To Win", {
              boardState: createOneMoveToWinBoard(),
              currentPlayer: 1,
              gameStarted: true,
            })
          }
          type="button"
        >
          One Move To Win
        </button>

        <button
          className="rounded bg-red-800 px-2 py-1 text-xs font-semibold text-white"
          onClick={() =>
            emitDebugState("Game Over P1", {
              boardState: createPlayerOneWinsBoard(),
              currentPlayer: 1,
              gameStarted: true,
            })
          }
          type="button"
        >
          Game Over P1
        </button>

        <button
          className="rounded bg-slate-800 px-2 py-1 text-xs font-semibold text-white"
          onClick={() =>
            emitDebugState("Force Draw", {
              boardState: createForcedDrawBoard(),
              currentPlayer: 1,
              gameStarted: true,
            })
          }
          type="button"
        >
          Force Draw
        </button>
      </div>

      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4].map((turn) => (
          <button
            key={turn}
            className="rounded bg-slate-700 px-2 py-1 text-xs font-semibold text-white"
            onClick={() =>
              emitDebugState(`Set Turn ${turn}`, {
                currentPlayer: turn as PlayerIndex,
              })
            }
            type="button"
          >
            Turn {turn}
          </button>
        ))}
      </div>

      <div
        className={`mt-2 rounded border px-2 py-1 text-xs ${statusClassName}`}
      >
        {status.message}
      </div>
    </div>
  );
}

export default DevSandboxPanel;
