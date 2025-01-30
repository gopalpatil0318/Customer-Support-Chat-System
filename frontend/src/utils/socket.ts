import io from "socket.io-client"

const socket = io("http://localhost:3000", {
  autoConnect: false,
})

export const connectSocket = (token: string) => {
  socket.auth = { token }
  socket.connect()
}

export const disconnectSocket = () => {
  socket.disconnect()
}

export const joinChat = (chatSessionId: number) => {
  socket.emit("join_chat", chatSessionId)
}

export const joinAgentRoom = (agentId: number) => {
  socket.emit("join_agent_room", agentId)
}

export default socket

