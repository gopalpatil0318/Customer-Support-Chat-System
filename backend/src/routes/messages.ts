import { Router } from "express"
import {
  initiateChatSession,
  sendMessage,
  getMessages,
  listAgents,
  listCustomerQueries,
  resolveQuery,
  getAllChats,
  getMessagesForAdmin,
} from "../controllers/ChatController"
import { authenticateToken, authorizeRole } from "../middleware/auth"

const messageRouter = Router()


messageRouter.post("/chat/initiate", authenticateToken, authorizeRole(["customer"]), initiateChatSession)
messageRouter.post("/chat/message", authenticateToken, sendMessage)
messageRouter.get("/chat/:chatSessionId/messages", authenticateToken, getMessages)
messageRouter.get("/agents", authenticateToken, authorizeRole(["customer"]), listAgents)
messageRouter.get("/customer-queries", authenticateToken, authorizeRole(["agent"]), listCustomerQueries)


messageRouter.post("/chat/resolve", authenticateToken, authorizeRole(["customer"]), resolveQuery)
messageRouter.get("/chats", authenticateToken, authorizeRole(["admin"]), getAllChats)
messageRouter.get("/chat/:chatSessionId/messagesforadmin", authenticateToken, getMessagesForAdmin)

export default messageRouter;

