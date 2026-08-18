import { BrowserRouter, Route, Routes } from "react-router";
import BoardPage from "./routes/BoardPage";
import CreateOrJoin from "./routes/CreateOrJoin";
import { SocketProvider } from "./context/SocketProvider";

function App() {
  console.log("Bundled Backend URL:", import.meta.env.VITE_BACKEND_URL);
  return (
    <SocketProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<CreateOrJoin />} />
          <Route path="/game/:roomId" element={<BoardPage />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
}

export default App;
