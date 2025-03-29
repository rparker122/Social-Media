"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, Send, Plus, Search, MoreVertical, Phone, Video, User, Users, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatTime } from "@/lib/utils"
import type { Message, User as UserType, Conversation } from "@/lib/types"
import { initializeSocket, getSocket, disconnectSocket } from "@/lib/socket"

export default function ChatPage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [contacts, setContacts] = useState<UserType[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({})
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<UserType[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Load user data and initialize socket
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }

    const userData = JSON.parse(storedUser) as UserType
    setUser(userData)

    // Initialize socket connection
    const socket = initializeSocket(userData.id)

    // Listen for online users
    socket.on("users:online", (users) => {
      const onlineStatus: Record<string, boolean> = {}
      users.forEach((user: { id: string; online: boolean }) => {
        onlineStatus[user.id] = user.online
      })
      setOnlineUsers(onlineStatus)
    })

    // Listen for user status changes
    socket.on("user:status", (data) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [data.userId]: data.status === "online",
      }))
    })

    // Listen for typing status
    socket.on("user:typing", (data) => {
      setTypingUsers((prev) => ({
        ...prev,
        [data.from]: data.isTyping,
      }))
    })

    // Listen for incoming messages
    socket.on("message:receive", (message) => {
      // Add message to the current conversation if it's active
      if (activeConversation === message.from) {
        setMessages((prev) => [...prev, message])

        // Mark message as read
        socket.emit("message:read", { messageId: message.id, from: message.from })
      }

      // Update conversation list
      updateConversationWithMessage(message)

      // Show notification if conversation is not active
      if (activeConversation !== message.from) {
        toast({
          title: "New message",
          description: `${message.from}: ${message.text.substring(0, 30)}${message.text.length > 30 ? "..." : ""}`,
        })
      }
    })

    // Listen for sent message confirmation
    socket.on("message:sent", (message) => {
      // Update message in the current conversation
      setMessages((prev) => [...prev, message])

      // Update conversation list
      updateConversationWithMessage(message)
    })

    // Listen for message status updates
    socket.on("message:status", (data) => {
      setMessages((prev) => prev.map((msg) => (msg.id === data.id ? { ...msg, status: data.status } : msg)))
    })

    // Listen for conversation history
    socket.on("conversation:history", (data) => {
      setMessages(data.messages)
    })

    // Listen for user search results
    socket.on("users:search:results", (results) => {
      setSearchResults(
        results.map((result: { id: string }) => ({
          id: result.id,
          name: result.id, // In a real app, you'd have actual names
          email: `${result.id}@example.com`,
          avatar: `/placeholder.svg?height=40&width=40`,
        })),
      )
    })

    // Clean up socket connection on unmount
    return () => {
      disconnectSocket()
    }
  }, [router, toast, activeConversation])

  // Update conversations when a new message is received
  const updateConversationWithMessage = (message: Message) => {
    const isIncoming = message.from !== user?.id
    const contactId = isIncoming ? message.from : message.to

    setConversations((prev) => {
      // Check if conversation exists
      const existingConvIndex = prev.findIndex((conv) => conv.id === contactId)

      if (existingConvIndex >= 0) {
        // Update existing conversation
        const updatedConversations = [...prev]
        updatedConversations[existingConvIndex] = {
          ...updatedConversations[existingConvIndex],
          lastMessage: message,
          unread:
            isIncoming && activeConversation !== contactId
              ? updatedConversations[existingConvIndex].unread + 1
              : updatedConversations[existingConvIndex].unread,
        }
        return updatedConversations
      } else {
        // Create new conversation
        const newConversation: Conversation = {
          id: contactId,
          user: {
            id: contactId,
            name: contactId, // In a real app, you'd have actual names
            email: `${contactId}@example.com`,
            avatar: `/placeholder.svg?height=40&width=40`,
          },
          lastMessage: message,
          unread: isIncoming ? 1 : 0,
        }
        return [...prev, newConversation]
      }
    })
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle search input
  useEffect(() => {
    if (searchQuery.trim()) {
      const socket = getSocket()
      socket.emit("users:search", { query: searchQuery })
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  // Change active conversation
  const handleConversationChange = (conversationId: string) => {
    setActiveConversation(conversationId)

    // Mark conversation as read
    setConversations((prev) => prev.map((conv) => (conv.id === conversationId ? { ...conv, unread: 0 } : conv)))

    // Get conversation history
    const socket = getSocket()
    socket.emit("conversation:get", { with: conversationId })

    // Reset typing indicator
    setIsTyping(false)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || !activeConversation) return

    // Send message via socket
    const socket = getSocket()
    socket.emit("message:send", { to: activeConversation, message: newMessage })

    // Clear input
    setNewMessage("")

    // Clear typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    socket.emit("user:typing", { to: activeConversation, isTyping: false })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)

    if (!user || !activeConversation) return

    // Send typing indicator
    const socket = getSocket()

    if (!isTyping) {
      setIsTyping(true)
      socket.emit("user:typing", { to: activeConversation, isTyping: true })
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      socket.emit("user:typing", { to: activeConversation, isTyping: false })
    }, 2000)
  }

  const handleLogout = () => {
    disconnectSocket()
    localStorage.removeItem("user")
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    })
    router.push("/login")
  }

  // Get active conversation data
  const activeConversationData = conversations.find((c) => c.id === activeConversation)

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-800 flex flex-col">
        {/* User header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-9 w-9 border border-gray-700">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="bg-gray-700 text-purple-300">{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-white">{user?.name}</div>
              <div className="text-xs text-green-400">Online</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search users..."
              className="pl-9 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="chats" className="flex-1 flex flex-col">
          <div className="px-4">
            <TabsList className="w-full bg-gray-800">
              <TabsTrigger
                value="chats"
                className="flex-1 data-[state=active]:bg-gray-700 data-[state=active]:text-purple-400"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chats
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="flex-1 data-[state=active]:bg-gray-700 data-[state=active]:text-purple-400"
              >
                <Users className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chats" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full">
              <div className="p-2 space-y-1">
                {conversations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No conversations yet. Search for users to start chatting.
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        activeConversation === conversation.id ? "bg-gray-700" : "hover:bg-gray-800"
                      }`}
                      onClick={() => handleConversationChange(conversation.id)}
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10 border border-gray-700">
                          <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
                          <AvatarFallback className="bg-gray-700 text-purple-300">
                            {conversation.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {onlineUsers[conversation.id] && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-700"></span>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-white">{conversation.user.name}</div>
                          <div className="text-xs text-gray-400">{formatTime(conversation.lastMessage.timestamp)}</div>
                        </div>
                        <div className="text-sm truncate text-gray-400 max-w-[180px]">
                          {conversation.lastMessage.from === user?.id ? "You: " : ""}
                          {conversation.lastMessage.text}
                        </div>
                      </div>
                      {conversation.unread > 0 && (
                        <div className="w-5 h-5 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center animate-pulse">
                          {conversation.unread}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="users" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full">
              <div className="p-2 space-y-1">
                {searchQuery.trim() === "" ? (
                  <div className="text-center py-8 text-gray-500">Search for users to start chatting</div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No users found matching "{searchQuery}"</div>
                ) : (
                  searchResults.map((contact) => (
                    <button
                      key={contact.id}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
                      onClick={() => {
                        // Find or create conversation with this contact
                        const existingConv = conversations.find((c) => c.user.id === contact.id)
                        if (existingConv) {
                          handleConversationChange(existingConv.id)
                        } else if (user) {
                          // Create new conversation
                          const newConv: Conversation = {
                            id: contact.id,
                            user: contact,
                            lastMessage: {
                              id: Date.now().toString(),
                              from: user.id,
                              to: contact.id,
                              text: "Hey there! I just added you as a contact.",
                              timestamp: new Date(),
                              status: "sent",
                            },
                            unread: 0,
                          }
                          setConversations((prev) => [...prev, newConv])
                          setActiveConversation(newConv.id)
                          setMessages([])

                          // Send initial message
                          const socket = getSocket()
                          socket.emit("message:send", {
                            to: contact.id,
                            message: "Hey there! I just added you as a contact.",
                          })
                        }
                      }}
                    >
                      <Avatar className="h-10 w-10 border border-gray-700">
                        <AvatarImage src={contact.avatar} alt={contact.name} />
                        <AvatarFallback className="bg-gray-700 text-purple-300">
                          {contact.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-white">{contact.name}</div>
                        <div className="text-sm text-gray-400">{contact.email}</div>
                      </div>
                      {onlineUsers[contact.id] && <div className="text-xs text-green-400">Online</div>}
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* New chat button */}
        <div className="p-4 border-t border-gray-800">
          <Button
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all duration-300"
            onClick={() => {
              setSearchQuery("")
              const tabsTrigger = document.querySelector('[data-state="inactive"][value="users"]') as HTMLButtonElement
              if (tabsTrigger) {
                tabsTrigger.click()
              }
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {activeConversationData ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-9 w-9 border border-gray-700">
                  <AvatarImage src={activeConversationData.user.avatar} alt={activeConversationData.user.name} />
                  <AvatarFallback className="bg-gray-700 text-purple-300">
                    {activeConversationData.user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-white">{activeConversationData.user.name}</div>
                  <div className="text-xs text-gray-400">
                    {onlineUsers[activeConversationData.id] ? "Online" : "Offline"}
                    {typingUsers[activeConversationData.id] && " • Typing..."}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
                  <User className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto">
                        <MessageSquare className="h-8 w-8 text-gray-600" />
                      </div>
                      <p className="text-gray-400">No messages yet</p>
                      <p className="text-sm text-gray-500">Send a message to start the conversation</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isUser = message.from === user?.id
                    const showAvatar = index === 0 || messages[index - 1].from !== message.from

                    return (
                      <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`flex ${isUser ? "flex-row-reverse" : "flex-row"} items-end space-x-2 ${isUser ? "space-x-reverse" : ""}`}
                        >
                          {!isUser && showAvatar ? (
                            <Avatar className="h-8 w-8 border border-gray-700">
                              <AvatarImage
                                src={activeConversationData.user.avatar}
                                alt={activeConversationData.user.name}
                              />
                              <AvatarFallback className="bg-gray-700 text-purple-300">
                                {activeConversationData.user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="w-8" />
                          )}
                          <div className={`max-w-md ${isUser ? "message-user" : "message-contact"}`}>
                            <div
                              className={`px-4 py-2 rounded-2xl ${
                                isUser
                                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                  : "bg-gray-800 text-white"
                              }`}
                            >
                              {message.text}
                            </div>
                            <div className={`text-xs mt-1 text-gray-500 ${isUser ? "text-right" : "text-left"}`}>
                              {formatTime(message.timestamp)}
                              {isUser && (
                                <span className="ml-1">
                                  {message.status === "sent" && "✓"}
                                  {message.status === "delivered" && "✓✓"}
                                  {message.status === "read" && <span className="text-blue-400">✓✓</span>}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                {typingUsers[activeConversationData.id] && (
                  <div className="flex justify-start">
                    <div className="flex items-end space-x-2">
                      <Avatar className="h-8 w-8 border border-gray-700">
                        <AvatarImage src={activeConversationData.user.avatar} alt={activeConversationData.user.name} />
                        <AvatarFallback className="bg-gray-700 text-purple-300">
                          {activeConversationData.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="px-4 py-2 rounded-2xl bg-gray-800 text-white message-contact">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 rounded-full bg-gray-500 animate-typing"></div>
                          <div className="w-2 h-2 rounded-full bg-gray-500 animate-typing-2"></div>
                          <div className="w-2 h-2 rounded-full bg-gray-500 animate-typing-3"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message input */}
            <div className="p-4 border-t border-gray-800">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={handleInputChange}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500"
                />
                <Button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all duration-300"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto">
                <MessageSquare className="h-10 w-10 text-gray-600" />
              </div>
              <h3 className="text-xl font-medium text-white">No conversation selected</h3>
              <p className="text-gray-400 max-w-md">
                Select a conversation from the sidebar or search for users to start messaging.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

