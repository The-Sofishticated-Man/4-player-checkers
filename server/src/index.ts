import express from "express";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// CORS middleware
app.use(
  cors({
    origin: "*", // Allow all origins for simplicity, adjust as needed
  })
);

const expressServer = app.listen(PORT, () => {
  console.log(`${new Date()} || server running at port: ${PORT}`);
});

const io = new Server(expressServer, {
  cors: {
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`${new Date().toISOString()}: a user connected`);
});
