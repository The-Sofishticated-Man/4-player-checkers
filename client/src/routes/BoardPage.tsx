import { useParams } from "react-router";
import Board from "../components/Board";
import BoardContextProvider from "../context/BoardContextProvider";
import { useJoinGame } from "../hooks/useJoinGame";

function BoardPage() {
  const { roomId } = useParams();
  console.log("BoardPage loaded with roomId:", roomId);
  const { initialStateFromServer } = useJoinGame(roomId!);

  return (
    <BoardContextProvider initialStateFromServer={initialStateFromServer!}>
      <Board/>
    </BoardContextProvider>
  );
}

export default BoardPage;
