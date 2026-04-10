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
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm text-sm font-medium text-slate-600">
            Syncing game state...
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-3 shadow-sm text-sm font-medium text-rose-700">
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
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <form
          onSubmit={handleNicknameSubmit}
          className="w-full max-w-xs bg-white border border-slate-200 rounded-lg p-4 shadow-sm"
        >
          <p className="text-sm text-slate-600 mb-3">Enter a username</p>
          <input
            type="text"
            value={nicknameInput}
            onChange={(event) => setNicknameInput(event.target.value)}
            placeholder={defaultNickname}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
            maxLength={24}
          />
          <button
            type="submit"
            className="w-full py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
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
