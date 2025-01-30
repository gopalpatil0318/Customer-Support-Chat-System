import type { Request, Response } from "express"
import pool from "../db"
import type { Server as SocketServer } from "socket.io"

let io: SocketServer

export const setSocketServer = (socketServer: SocketServer) => {
  io = socketServer
}

export const initiateChatSession = async (req: Request, res: any) => {
  const customerId = req.user?.id
  const { agentId } = req.body

  if (!customerId) {
    return res.status(401).json({ error: "User not authenticated" })
  }

  try {
    const existingSession = await pool.query(
      "SELECT id FROM chat_sessions WHERE customer_id = $1 AND agent_id = $2",
      [customerId, agentId],
    )

    if (existingSession.rows.length > 0) {
      return res.status(200).json({
        message: "Existing chat session found",
        chatSessionId: existingSession.rows[0].id,
        status: "active",
      })
    }

    const result = await pool.query(
      "INSERT INTO chat_sessions (customer_id, agent_id, status) VALUES ($1, $2, $3) RETURNING id",
      [customerId, agentId, "active"],
    )

    const chatSessionId = result.rows[0].id


    io.to(`agent:${agentId}`).emit("new_chat_session", { chatSessionId, customerId })

    res.status(201).json({
      message: "Chat session initiated successfully",
      chatSessionId,
      status: "active",
    })
  } catch (error) {
    console.error("Error initiating chat session:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

export const sendMessage = async (req: Request, res: any) => {
  const senderId = req.user?.id
  const { chatSessionId, message } = req.body

  if (!senderId) {
    return res.status(401).json({ error: "User not authenticated" })
  }

  try {
    const result = await pool.query(
      "INSERT INTO messages (chat_session_id, sender_id, message) VALUES ($1, $2, $3) RETURNING id, sent_at",
      [chatSessionId, senderId, message],
    )

    await pool.query("UPDATE chat_sessions SET status = $1 WHERE id = $2", ["active", chatSessionId])

    io.to(`chat:${chatSessionId}`).emit("query_active", { chatSessionId })

    const newMessage = result.rows[0]

    // io.to(`chat:${chatSessionId}`).emit("new_message", {
    //   id: newMessage.id,
    //   sender_id: senderId,
    //   message,
    //   sent_at: newMessage.sent_at,
    // })

    res.status(201).json({
      message: "Message sent successfully",
      messageId: newMessage.id,
    })
  } catch (error) {
    console.error("Error sending message:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

export const getMessages = async (req: Request, res: any) => {
  const userId = req.user?.id
  const { chatSessionId } = req.params

  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" })
  }

  try {
    const result = await pool.query(
      "SELECT m.id, m.sender_id, m.message, m.sent_at FROM messages m JOIN chat_sessions cs ON m.chat_session_id = cs.id WHERE cs.id = $1 AND (cs.customer_id = $2 OR cs.agent_id = $2) ORDER BY m.sent_at ASC",
      [chatSessionId, userId],
    )
    const status = await pool.query(
      "SELECT status FROM chat_sessions WHERE id = $1",
      [chatSessionId]
    );

    res.status(200).json({
      status: status.rows[0]?.status,
      messages: result.rows,
    })
  } catch (error) {
    console.error("Error retrieving messages:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

export const listAgents = async (req: Request, res: any) => {
  try {
    const result = await pool.query("SELECT id, name, product_name FROM users WHERE role = $1", ["agent"])

    res.status(200).json({
      agents: result.rows,
    })
  } catch (error) {
    console.error("Error listing agents:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

export const listCustomerQueries = async (req: Request, res: any) => {
  const agentId = req.user?.id

  if (!agentId) {
    return res.status(401).json({ error: "User not authenticated" })
  }

  try {
    const result = await pool.query(
      "SELECT cs.id as chat_session_id, u.id as customer_id, u.name as customer_name, cs.status FROM chat_sessions cs JOIN users u ON cs.customer_id = u.id WHERE cs.agent_id = $1 ORDER BY cs.created_at DESC",
      [agentId],
    )

    res.status(200).json({
      customerQueries: result.rows,
    })
  } catch (error) {
    console.error("Error listing customer queries:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}



export const resolveQuery = async (req: Request, res: any) => {
  const userId = req.user?.id
  const { chatSessionId } = req.body

  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" })
  }

  try {
    await pool.query("UPDATE chat_sessions SET status = $1 WHERE id = $2", ["resolved", chatSessionId])

    io.to(`chat:${chatSessionId}`).emit("query_resolved", { chatSessionId })

    res.status(200).json({ message: "Query resolved successfully" })
  } catch (error) {
    console.error("Error resolving query:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

export const getAllChats = async (req: Request, res: any) => {
  const userId = req.user?.id

  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" })
  }

  try {
    const result = await pool.query(`
      SELECT cs.id, cs.status, cs.created_at, 
             c.id as customer_id, c.name as customer_name,
             a.id as agent_id, a.name as agent_name , a.product_name AS agent_product_name
      FROM chat_sessions cs
      JOIN users c ON cs.customer_id = c.id
      JOIN users a ON cs.agent_id = a.id
      ORDER BY cs.created_at DESC
    `)

    res.status(200).json({ chats: result.rows })
  } catch (error) {
    console.error("Error fetching all chats:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}



export const getMessagesForAdmin = async (req: Request, res: any) => {
  const userId = req.user?.id;
  const { chatSessionId } = req.params;

  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  if (!chatSessionId) {
    return res.status(400).json({ error: "Chat session ID is required" });
  }

  try {
   
    const result = await pool.query(
      `SELECT id, sender_id, message, sent_at 
       FROM messages 
       WHERE chat_session_id = $1 
       ORDER BY sent_at ASC`,
      [chatSessionId]
    );

  
    const statusResult = await pool.query(
      `SELECT status FROM chat_sessions WHERE id = $1`,
      [chatSessionId]
    );

    const chatStatus = statusResult.rows[0]?.status;

    res.status(200).json({
      status: chatStatus || "unknown", // Return "unknown" if no status found
      messages: result.rows,
    });
  } catch (error) {
    console.error("Error retrieving messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
