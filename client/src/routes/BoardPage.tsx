import { useState, type FormEvent } from "react";
import { useParams } from "react-router";
import Board from "../components/Board";
import GameContextProvider from "../context/BoardContextProvider";
import { useJoinGame } from "../hooks/useJoinGame";
import SideMenu, { SideMenuSkeleton } from "../components/SideMenu";
import DevSandboxPanel from "../components/DevSandboxPanel";
import {
  MAX_NICKNAME_LENGTH,
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
        <SideMenuSkeleton />
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
            background: "var(--app-error-surface)",
            borderColor: "var(--app-error-border)",
            color: "var(--app-error-text)",
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <SideMenu />
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
  const [nicknameError, setNicknameError] = useState<string | null>(null);

  const handleNicknameSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedNickname = nicknameInput.trim();
    if (trimmedNickname.length > MAX_NICKNAME_LENGTH) {
      setNicknameError(
        `Nickname must be ${MAX_NICKNAME_LENGTH} characters or fewer.`,
      );
      return;
    }

    const resolvedNickname = resolveNickname(nicknameInput, playerId);
    setStoredNickname(resolvedNickname);
    setNickname(resolvedNickname);
    setNicknameError(null);
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
            onChange={(event) => {
              setNicknameInput(event.target.value);
              setNicknameError(null);
            }}
            placeholder={defaultNickname}
            className="mb-3 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
            style={{ borderColor: "var(--app-border)" }}
            maxLength={MAX_NICKNAME_LENGTH}
          />
          {nicknameError ? (
            <p
              className="mb-3 text-sm"
              style={{ color: "var(--app-error-text)" }}
            >
              {nicknameError}
            </p>
          ) : null}
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
