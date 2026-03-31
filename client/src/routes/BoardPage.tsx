import { useState } from "react";
import { useParams } from "react-router";
import Board from "../components/Board";
import GameContextProvider from "../context/BoardContextProvider";
import { useJoinGame } from "../hooks/useJoinGame";
import { printBoard } from "../utils/debugUtils";
import PlayerBoard from "../components/PlayerBoard";
import DevSandboxPanel from "../components/DevSandboxPanel";

// Inner component that uses the joined game data and has access to context
function BoardPageInner({
  roomId,
  allowMoveAnyPiece,
}: {
  roomId: string;
  allowMoveAnyPiece: boolean;
}) {
  const { initialStateFromServer, playerIndex } = useJoinGame(roomId); // Now this has access to the context

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

  return (
    <GameContextProvider>
      <PlayerBoard />
      <BoardPageInner roomId={roomId!} allowMoveAnyPiece={allowMoveAnyPiece} />
      <DevSandboxPanel
        roomId={roomId!}
        allowMoveAnyPiece={allowMoveAnyPiece}
        onToggleMoveAnyPiece={setAllowMoveAnyPiece}
      />
    </GameContextProvider>
  );
}

export default BoardPage;
