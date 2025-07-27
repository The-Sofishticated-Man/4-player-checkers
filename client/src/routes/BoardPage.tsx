import { useParams } from "react-router";
import Board from "../components/Board";
import BoardContextProvider from "../context/BoardContextProvider";
import { useJoinGame } from "../hooks/useJoinGame";
import { printBoard } from "../utils/debugUtils";

// Inner component that uses the joined game data and has access to context
function BoardPageInner({ roomId }: { roomId: string }) {
  const { initialStateFromServer, playerIndex } = useJoinGame(roomId); // Now this has access to the context

  console.log("BoardPage loaded with roomId:", roomId);
  if (initialStateFromServer?.checkersBoardState) {
    printBoard(initialStateFromServer.checkersBoardState);
    console.log("Current player: " + initialStateFromServer.currentPlayer);
    console.log(`Player index:`, playerIndex);
  } else {
    console.log("No initial board state received from server.");
  }

  return <Board />;
}

function BoardPage() {
  const { roomId } = useParams();

  return (
    <BoardContextProvider>
      <BoardPageInner roomId={roomId!} />
    </BoardContextProvider>
  );
}

export default BoardPage;
