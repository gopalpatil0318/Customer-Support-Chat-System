import { Server as SocketServer } from "socket.io";
import jwt from "jsonwebtoken";
import { setSocketServer } from "../controllers/ChatController";

interface DecodedToken {
  id: string;
}

export const initializeSocketServer = (server) => {
  const io = new SocketServer(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  setSocketServer(io);
  io.use((socket, next) => {
    const token = socket.handshake.query.token;
    
    const tokenString = Array.isArray(token) ? token[0] : token;
  
    if (!tokenString) {
      return next(new Error("Authentication error: No token provided"));
    }
  
    try {
      const decoded = jwt.verify(tokenString, process.env.JWT_SECRET as string) as DecodedToken;
      socket.data.userId = decoded.id;
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });
  

  io.on("connection", (socket) => {
    const userId = socket.data.userId;
    console.log("A user connected with ID:", userId);

    // Emit user status change to all clients
    io.emit("user_status_change", { userId, isOnline: true });

    socket.on("join_chat", (chatSessionId) => {
      console.log(`User ${userId} joined chat ${chatSessionId}`);
      socket.join(`chat:${chatSessionId}`);
    });

    socket.on("join_agent_room", (agentId) => {
      console.log(`Agent ${agentId} joined their room`);
      socket.join(`agent:${agentId}`);
    });

    socket.on("send_message", async (data) => {
      const { chatSessionId, message } = data;
      // Emit the message only to other clients in the chat room
      socket.to(`chat:${chatSessionId}`).emit("new_message", message);
    });

    socket.on("typing", (data) => {
      const { chatSessionId, isTyping } = data;
      // Emit typing status to all clients in the chat room except the sender
      socket.to(`chat:${chatSessionId}`).emit("typing_status", {
        userId,
        isTyping,
        chatSessionId
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", userId);
      // Emit user status change to all clients
      io.emit("user_status_change", { userId, isOnline: false });
    });
  });
};