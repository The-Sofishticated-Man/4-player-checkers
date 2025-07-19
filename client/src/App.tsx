import { BrowserRouter, Route, Routes } from "react-router";
import BoardPage from "./routes/BoardPage";
import CreateOrJoin from "./routes/CreateOrJoin";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreateOrJoin />} />
        <Route path="/game/:roomId" element={<BoardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
