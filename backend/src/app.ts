import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import messageRouter from "./routes/messages";
import userRouter from "./routes/auth";
import { initializeSocketServer } from "./socket/socket";

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.use("/api", userRouter);
app.use("/api", messageRouter);

initializeSocketServer(server);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
