import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import messageRouter from "./routes/messages";
import userRouter from "./routes/auth";
import { initializeSocketServer } from "./socket/socket";
import chatBotRouter from "./routes/chatbot";

const app = express();
const server = http.createServer(app);

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api", userRouter);
app.use("/api", messageRouter);
app.use("/api", chatBotRouter);

initializeSocketServer(server);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
