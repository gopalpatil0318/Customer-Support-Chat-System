import { Server as SocketServer } from "socket.io";
import jwt from "jsonwebtoken";
import { setSocketServer } from "../controllers/ChatController";

interface DecodedToken {
  id: string;
  role:string;
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
      socket.data.role = decoded.role;
      
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });
  
  const userSocketMap: { [key: string]: string } = {};

  io.on("connection", (socket) => {
    const userId = socket.data.userId;
    console.log("A user connected with ID:", userId);

   if (userId) userSocketMap[userId] = socket.id;

   io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("join_chat", (chatSessionId) => {
      console.log(`User ${userId} joined chat ${chatSessionId}`);
      socket.join(`chat:${chatSessionId}`);
    });

  

    socket.on("send_message", async (data) => {
      const { chatSessionId, message } = data;
     
      socket.to(`chat:${chatSessionId}`).emit("new_message", message);
    });

    socket.on("typing", (data) => {
      const { chatSessionId, isTyping } = data;
      
      socket.to(`chat:${chatSessionId}`).emit("typing_status", {
        userId,
        isTyping,
        chatSessionId
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", userId);
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
};