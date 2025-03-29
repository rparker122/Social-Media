const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")
const { Server } = require("socket.io")

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

// In-memory storage for connected users and messages
const users = new Map()
const messages = new Map()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  const io = new Server(server)

  io.on("connection", (socket) => {
    const userId = socket.handshake.auth.userId

    if (!userId) {
      socket.disconnect()
      return
    }

    console.log(`User connected: ${userId}`)

    // Store user connection
    users.set(userId, {
      id: userId,
      socketId: socket.id,
      online: true,
    })

    // Broadcast user online status
    socket.broadcast.emit("user:status", { userId, status: "online" })

    // Send list of online users to the newly connected user
    const onlineUsers = Array.from(users.values())
      .filter((user) => user.online)
      .map((user) => ({ id: user.id, online: user.online }))

    socket.emit("users:online", onlineUsers)

    // Handle private messages
    socket.on("message:send", (data) => {
      const { to, message } = data
      const from = userId

      // Generate message ID
      const messageId = Date.now().toString()

      // Create message object
      const messageObj = {
        id: messageId,
        from,
        to,
        text: message,
        timestamp: new Date(),
        status: "sent",
      }

      // Store message
      if (!messages.has(`${from}:${to}`)) {
        messages.set(`${from}:${to}`, [])
      }
      messages.get(`${from}:${to}`).push(messageObj)

      if (!messages.has(`${to}:${from}`)) {
        messages.set(`${to}:${from}`, [])
      }
      messages.get(`${to}:${from}`).push(messageObj)

      // Find recipient socket
      const recipientUser = users.get(to)

      if (recipientUser && recipientUser.online) {
        // Send to recipient
        io.to(recipientUser.socketId).emit("message:receive", messageObj)

        // Update message status to delivered
        messageObj.status = "delivered"
        socket.emit("message:status", { id: messageId, status: "delivered" })
      }

      // Send confirmation to sender
      socket.emit("message:sent", messageObj)
    })

    // Handle message read status
    socket.on("message:read", (data) => {
      const { messageId, from } = data

      // Find sender socket
      const senderUser = users.get(from)

      if (senderUser && senderUser.online) {
        // Notify sender that message was read
        io.to(senderUser.socketId).emit("message:status", { id: messageId, status: "read" })
      }
    })

    // Handle user typing status
    socket.on("user:typing", (data) => {
      const { to, isTyping } = data

      // Find recipient socket
      const recipientUser = users.get(to)

      if (recipientUser && recipientUser.online) {
        // Send typing status to recipient
        io.to(recipientUser.socketId).emit("user:typing", { from: userId, isTyping })
      }
    })

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${userId}`)

      if (users.has(userId)) {
        const user = users.get(userId)
        user.online = false

        // Broadcast user offline status
        socket.broadcast.emit("user:status", { userId, status: "offline" })
      }
    })

    // Handle get conversation history
    socket.on("conversation:get", (data) => {
      const { with: withUserId } = data

      // Get conversation history
      const conversationKey = `${userId}:${withUserId}`
      const conversationHistory = messages.has(conversationKey) ? messages.get(conversationKey) : []

      // Send conversation history
      socket.emit("conversation:history", { with: withUserId, messages: conversationHistory })
    })

    // Handle user search
    socket.on("users:search", (data) => {
      const { query } = data

      // Simple search implementation
      const searchResults = Array.from(users.keys())
        .filter((id) => id !== userId) // Exclude current user
        .filter((id) => id.toLowerCase().includes(query.toLowerCase()))
        .map((id) => ({ id }))

      socket.emit("users:search:results", searchResults)
    })
  })

  server.listen(3001, (err) => {
    if (err) throw err
    console.log("> Ready on http://localhost:3001")
  })
})

