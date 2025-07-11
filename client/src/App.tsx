import Board from "./components/Board";
import { DndContext } from "@dnd-kit/core";
function App() {
  return (
    <DndContext>
      <Board />
    </DndContext>
  );
}
export default App;
