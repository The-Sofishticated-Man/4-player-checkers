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
  turnsWithoutProgress?: number;
  stallDrawFullRounds?: number;
}

type StatusKind = "info" | "success" | "error";

interface SandboxStatus {
  kind: StatusKind;
  message: string;
}

interface SandboxRoomSnapshot {
  roomID: string;
  sandboxMode: boolean;
  minPlayersToStart: number;
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
  board[10][10] = 2;
  return board;
};

const createSoftCrownBoard = (): BoardState => {
  const board = createEmptyPlayableBoard(initialState.boardState);
  board[4][2] = 1;
  board[10][10] = 2;
  return board;
};

const createStallDrawNextMoveBoard = (): BoardState => {
  const board = createEmptyPlayableBoard(initialState.boardState);
  board[8][4] = 1;
  board[5][9] = 2;
  return board;
};

const createOneMoveToWinBoard = (): BoardState => {
  const board = createEmptyPlayableBoard(initialState.boardState);
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
  const [collapsed, setCollapsed] = useState(false); // ← new
  const sandboxEnabled = snapshot?.sandboxMode === true;

  useEffect(() => {
    if (!sandboxEnabled && allowMoveAnyPiece) {
      onToggleMoveAnyPiece(false);
    }
  }, [sandboxEnabled, allowMoveAnyPiece, onToggleMoveAnyPiece]);

  useEffect(() => {
    if (!socket) return;

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
      if (!pendingAction) return;
      setStatus({ kind: "success", message: `${pendingAction} applied` });
      setPendingAction(null);
    };

    const handleSandboxRoomState = (payload: SandboxRoomSnapshot) => {
      if (payload.roomID !== roomId) return;
      setSnapshot(payload);
    };

    const handleMoveMade = () => {
      if (!pendingAction) return;
      setStatus({ kind: "success", message: `${pendingAction} applied` });
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
    if (!socket || !isConnected) return;
    socket.emit("sandbox-get-room-state", { roomID: roomId });
  }, [socket, isConnected, roomId]);

  if (!import.meta.env.DEV) return null;

  // ── Collapsed state: tiny clickable square ──────────────────────────────
  if (collapsed) {
    return (
      <button
        className="fixed bottom-4 left-4 z-50 flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 shadow-lg transition-transform hover:scale-110 active:scale-95"
        onClick={() => setCollapsed(false)}
        type="button"
        aria-label="Expand Dev Sandbox"
        title="Dev Sandbox"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 9v-1a3 3 0 0 1 6 0v1" />
          <path d="M8 9h8a6 6 0 0 1 1 3v3a5 5 0 0 1-10 0v-3a6 6 0 0 1 1-3" />
          <line x1="3" y1="13" x2="7" y2="13" />
          <line x1="17" y1="13" x2="21" y2="13" />
          <line x1="12" y1="20" x2="12" y2="22" />
          <line x1="4" y1="19" x2="7.35" y2="16.65" />
          <line x1="20" y1="19" x2="16.65" y2="16.65" />
        </svg>
      </button>
    );
  }

  // ── Expanded state (original panel + collapse button) ───────────────────
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

    if (!sandboxEnabled) {
      setStatus({ kind: "error", message: "Server sandbox mode is OFF" });
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
    if (!sandboxEnabled) {
      onToggleMoveAnyPiece(false);
      setStatus({
        kind: "error",
        message: "Move Any Piece requires server sandbox mode",
      });
      return;
    }

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
      <div className="mb-1 flex items-center justify-between">
        <p className="text-sm font-semibold text-orange-800">Dev Sandbox</p>
        <button
          className="ml-4 flex h-5 w-5 items-center justify-center rounded text-orange-700 hover:bg-orange-200 active:bg-orange-300"
          onClick={() => setCollapsed(true)}
          type="button"
          aria-label="Collapse Dev Sandbox"
          title="Collapse"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      <p className="mb-1 text-xs text-orange-700">
        Runs only in Vite dev. Requires CHECKERS_SANDBOX=true on server.
      </p>
      <p className="mb-1 text-xs text-orange-700">
        Server sandbox: {sandboxEnabled ? "ON" : "OFF"}
      </p>
      <p className="mb-1 text-xs text-orange-700">
        Min players to start: {snapshot?.minPlayersToStart ?? "-"}
      </p>
      <p className="mb-2 text-xs text-orange-700">
        Socket: {isConnected ? "Connected" : "Disconnected"}
      </p>
      <p className="mb-2 text-xs text-orange-700">
        Players: {snapshot?.connectedPlayerCount ?? 0}/
        {snapshot?.playerCount ?? 0} connected
      </p>
      <p className="mb-2 text-xs text-orange-700">
        Quiet turns: {snapshot?.gameState.turnsWithoutProgress ?? 0}/
        {snapshot?.gameState.stallDrawFullRounds ?? 20} rounds
      </p>

      <div className="mb-2 flex flex-wrap gap-2">
        <button
          className={`rounded px-2 py-1 text-xs font-semibold text-white ${
            allowMoveAnyPiece ? "bg-emerald-700" : "bg-slate-700"
          }`}
          onClick={handleToggleMoveAnyPiece}
          type="button"
          disabled={!sandboxEnabled}
        >
          {allowMoveAnyPiece ? "Move Any Piece: ON" : "Move Any Piece: OFF"}
        </button>
      </div>

      <fieldset
        className="flex flex-wrap gap-2 disabled:opacity-60"
        disabled={!sandboxEnabled || !isConnected}
      >
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
          className="rounded bg-violet-700 px-2 py-1 text-xs font-semibold text-white"
          onClick={() =>
            emitDebugState("Soft Crown Test", {
              boardState: createSoftCrownBoard(),
              currentPlayer: 1,
              gameStarted: true,
              turnsWithoutProgress: 0,
            })
          }
          type="button"
        >
          Soft Crown Test
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

        <button
          className="rounded bg-fuchsia-700 px-2 py-1 text-xs font-semibold text-white"
          onClick={() =>
            emitDebugState("Stall Draw Next Move", {
              boardState: createStallDrawNextMoveBoard(),
              currentPlayer: 1,
              gameStarted: true,
              stallDrawFullRounds: 1,
              turnsWithoutProgress: 1,
            })
          }
          type="button"
        >
          Stall Draw Next Move
        </button>
      </fieldset>

      <fieldset
        className="mt-2 flex gap-1 disabled:opacity-60"
        disabled={!sandboxEnabled || !isConnected}
      >
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
      </fieldset>

      <div
        className={`mt-2 rounded border px-2 py-1 text-xs ${statusClassName}`}
      >
        {status.message}
      </div>
    </div>
  );
}

export default DevSandboxPanel;
