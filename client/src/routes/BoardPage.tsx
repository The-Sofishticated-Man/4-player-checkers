import { useParams } from "react-router";
import Board from "../components/Board";
import BoardContextProvider from "../context/BoardContextProvider";
import { useJoinGame } from "../hooks/useJoinGame";
import initialState from "../utils/initialState";

function BoardPageContent() {
  const { roomId } = useParams();
  useJoinGame(roomId!); // This will handle socket events and dispatch updates

  return <Board />;
}

function BoardPage() {
  const { roomId } = useParams();
  console.log("BoardPage loaded with roomId:", roomId);

  return (
    <BoardContextProvider initialStateFromServer={initialState}>
      <BoardPageContent />
    </BoardContextProvider>
  );
}

export default BoardPage;
