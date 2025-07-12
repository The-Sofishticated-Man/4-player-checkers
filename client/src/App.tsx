import Board from "./components/Board";
import BoardContextProvider from "./context/BoardContextProvider";

function App() {
  return (
    <BoardContextProvider>
      <Board />
    </BoardContextProvider>
  );
}
export default App;
