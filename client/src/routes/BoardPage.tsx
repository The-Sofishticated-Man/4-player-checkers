import { useState, type FormEvent } from "react";
import { useParams } from "react-router";
import Board from "../components/Board";
import GameContextProvider from "../context/BoardContextProvider";
import { useJoinGame } from "../hooks/useJoinGame";
import { printBoard } from "../utils/debugUtils";
import PlayerBoard from "../components/PlayerBoard";
import DevSandboxPanel from "../components/DevSandboxPanel";
import {
  getDefaultNicknameForPlayerId,
  getOrCreatePlayerId,
  resolveNickname,
} from "../utils/playerIdentity";

// Inner component that uses the joined game data and has access to context
function BoardPageInner({
  roomId,
  allowMoveAnyPiece,
  nickname,
}: {
  roomId: string;
  allowMoveAnyPiece: boolean;
  nickname: string;
}) {
  const { initialStateFromServer, playerIndex } = useJoinGame(roomId, nickname);

  console.log("BoardPage loaded with roomId:", roomId);
  if (initialStateFromServer?.boardState) {
    printBoard(initialStateFromServer.boardState);
    console.log("Current player: " + initialStateFromServer.currentPlayer);
    console.log(`Player index:`, playerIndex);
  } else {
    console.log("No initial board state received from server.");
  }

  return <Board allowMoveAnyPiece={allowMoveAnyPiece} />;
}

function BoardPage() {
  const { roomId } = useParams();
  const [allowMoveAnyPiece, setAllowMoveAnyPiece] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [nickname, setNickname] = useState<string | null>(null);
  const playerId = getOrCreatePlayerId();
  const defaultNickname = getDefaultNicknameForPlayerId(playerId);

  const handleNicknameSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNickname(resolveNickname(nicknameInput, playerId));
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
      <PlayerBoard />
      <BoardPageInner
        roomId={roomId}
        allowMoveAnyPiece={allowMoveAnyPiece}
        nickname={nickname}
      />
      <DevSandboxPanel
        roomId={roomId}
        allowMoveAnyPiece={allowMoveAnyPiece}
        onToggleMoveAnyPiece={setAllowMoveAnyPiece}
      />
    </GameContextProvider>
  );
}

export default BoardPage;
