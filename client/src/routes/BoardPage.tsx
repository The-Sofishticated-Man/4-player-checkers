import { useState, type FormEvent } from "react";
import { useParams } from "react-router";
import Board from "../components/Board";
import GameContextProvider from "../context/BoardContextProvider";
import { useJoinGame } from "../hooks/useJoinGame";
import PlayerBoard, { PlayerBoardSkeleton } from "../components/PlayerBoard";
import DevSandboxPanel from "../components/DevSandboxPanel";
import {
  getDefaultNicknameForPlayerId,
  getOrCreatePlayerId,
  getStoredNickname,
  resolveNickname,
  setStoredNickname,
} from "../utils/playerIdentity";

function BoardSession({
  roomId,
  allowMoveAnyPiece,
  onToggleMoveAnyPiece,
  nickname,
}: {
  roomId: string;
  allowMoveAnyPiece: boolean;
  onToggleMoveAnyPiece: React.Dispatch<React.SetStateAction<boolean>>;
  nickname: string;
}) {
  const { isConnecting, error } = useJoinGame(roomId, nickname);

  if (isConnecting) {
    return (
      <>
        <PlayerBoardSkeleton />
        <div
          className="min-h-screen flex items-center justify-center p-4"
          style={{ background: "var(--page-bg)" }}
        >
          <div
            className="rounded-xl border px-5 py-3 shadow-sm text-sm font-medium"
            style={{
              background: "var(--app-surface-strong)",
              borderColor: "var(--app-border)",
              color: "var(--app-muted)",
            }}
          >
            Syncing game state...
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "var(--page-bg)" }}
      >
        <div
          className="rounded-xl border px-5 py-3 shadow-sm text-sm font-medium"
          style={{
            background: "rgba(255, 238, 239, 0.95)",
            borderColor: "rgba(225, 164, 170, 0.6)",
            color: "#8f4550",
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <PlayerBoard />
      <Board allowMoveAnyPiece={allowMoveAnyPiece} />
      <DevSandboxPanel
        roomId={roomId}
        allowMoveAnyPiece={allowMoveAnyPiece}
        onToggleMoveAnyPiece={onToggleMoveAnyPiece}
      />
    </>
  );
}

function BoardPage() {
  const { roomId } = useParams();
  const [allowMoveAnyPiece, setAllowMoveAnyPiece] = useState(false);
  const playerId = getOrCreatePlayerId();
  const defaultNickname = getDefaultNicknameForPlayerId(playerId);
  const [nicknameInput, setNicknameInput] = useState("");
  const [nickname, setNickname] = useState<string | null>(() =>
    getStoredNickname(),
  );

  const handleNicknameSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const resolvedNickname = resolveNickname(nicknameInput, playerId);
    setStoredNickname(resolvedNickname);
    setNickname(resolvedNickname);
  };

  if (!roomId) {
    return null;
  }

  if (!nickname) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "var(--page-bg)" }}
      >
        <form
          onSubmit={handleNicknameSubmit}
          className="w-full max-w-xs rounded-lg p-4 shadow-sm"
          style={{
            background: "var(--app-surface-strong)",
            border: "1px solid var(--app-border)",
          }}
        >
          <p className="mb-3 text-sm" style={{ color: "var(--app-muted)" }}>
            Enter a username
          </p>
          <input
            type="text"
            value={nicknameInput}
            onChange={(event) => setNicknameInput(event.target.value)}
            placeholder={defaultNickname}
            className="mb-3 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
            style={{ borderColor: "var(--app-border)" }}
            maxLength={24}
          />
          <button
            type="submit"
            className="w-full rounded-md py-2 text-sm font-semibold text-white transition-colors"
            style={{
              background:
                "linear-gradient(135deg, var(--player-2-accent), var(--player-1-accent))",
            }}
          >
            Enter Game
          </button>
        </form>
      </div>
    );
  }

  return (
    <GameContextProvider>
      <BoardSession
        roomId={roomId}
        allowMoveAnyPiece={allowMoveAnyPiece}
        onToggleMoveAnyPiece={setAllowMoveAnyPiece}
        nickname={nickname}
      />
    </GameContextProvider>
  );
}

export default BoardPage;
