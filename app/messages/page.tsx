"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Send, Plus, Phone, Video } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { User } from "@/lib/types"
import { getCurrentUser } from "@/lib/auth"
import { sampleUsers } from "@/lib/sample-data"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
}

interface Conversation {
  id: string
  user: User
  lastMessage: Message
  unread: number
}

export default function MessagesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          router.push("/login")
          return
        }

        setUser(currentUser)

        // Generate sample conversations
        // In a real app, this would be an API call
        const sampleConversations: Conversation[] = sampleUsers.map((sampleUser) => {
          const lastMessage: Message = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            senderId: Math.random() > 0.5 ? currentUser.id : sampleUser.id,
            receiverId: Math.random() > 0.5 ? sampleUser.id : currentUser.id,
            content: getRandomMessage(),
            timestamp: new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)).toISOString(),
          }

          return {
            id: sampleUser.id,
            user: sampleUser,
            lastMessage,
            unread: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0,
          }
        })

        setConversations(sampleConversations)

        // Set first conversation as active
        if (sampleConversations.length > 0) {
          setActiveConversation(sampleConversations[0].id)

          // Generate sample messages for first conversation
          setMessages(generateSampleMessages(currentUser.id, sampleConversations[0].user.id))
        }
      } catch (error) {
        console.error("Error loading messages:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !user || !activeConversation) return

    const conversation = conversations.find((c) => c.id === activeConversation)
    if (!conversation) return

    // Create new message
    const newMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      senderId: user.id,
      receiverId: conversation.user.id,
      content: newMessage,
      timestamp: new Date().toISOString(),
    }

    // Add to messages
    setMessages((prev) => [...prev, newMsg])

    // Update conversation
    setConversations((prev) =>
      prev.map((conv) => (conv.id === activeConversation ? { ...conv, lastMessage: newMsg } : conv)),
    )

    // Clear input
    setNewMessage("")

    // Simulate reply after delay
    setTimeout(
      () => {
        const replyMsg: Message = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          senderId: conversation.user.id,
          receiverId: user.id,
          content: getRandomReply(),
          timestamp: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, replyMsg])

        setConversations((prev) =>
          prev.map((conv) => (conv.id === activeConversation ? { ...conv, lastMessage: replyMsg } : conv)),
        )
      },
      1000 + Math.random() * 2000,
    )
  }

  const handleConversationChange = (conversationId: string) => {
    setActiveConversation(conversationId)

    // Mark conversation as read
    setConversations((prev) => prev.map((conv) => (conv.id === conversationId ? { ...conv, unread: 0 } : conv)))

    // Get conversation messages
    if (user) {
      const conversation = conversations.find((c) => c.id === conversationId)
      if (conversation) {
        setMessages(generateSampleMessages(user.id, conversation.user.id))
      }
    }
  }

  function generateSampleMessages(userId: string, otherUserId: string): Message[] {
    const count = 5 + Math.floor(Math.random() * 10)
    const messages: Message[] = []

    for (let i = 0; i < count; i++) {
      const isFromUser = Math.random() > 0.5
      messages.push({
        id: `msg-${i}-${Math.random().toString(36).substring(2, 9)}`,
        senderId: isFromUser ? userId : otherUserId,
        receiverId: isFromUser ? otherUserId : userId,
        content: getRandomMessage(),
        timestamp: new Date(Date.now() - (count - i) * 1000 * 60 * 10).toISOString(),
      })
    }

    return messages
  }

  function getRandomMessage(): string {
    const messages = [
      "Hey, how's it going?",
      "Did you see that new movie that just came out?",
      "I'm thinking about getting a new laptop. Any recommendations?",
      "Just finished that book you recommended. It was amazing!",
      "Are we still on for coffee next week?",
      "Check out this cool article I found!",
      "Happy birthday! Hope you have a great day!",
      "Can you send me that file we talked about?",
      "I'm going to be in your area next month. We should meet up!",
      "What did you think about the game last night?",
    ]

    return messages[Math.floor(Math.random() * messages.length)]
  }

  function getRandomReply(): string {
    const replies = [
      "I'm doing well, thanks for asking! How about you?",
      "Yes, I saw it last weekend. The special effects were incredible!",
      "I'd recommend the new MacBook Pro if you can afford it, otherwise the Dell XPS is great too.",
      "I'm so glad you liked it! I have another one by the same author you might enjoy.",
      "Looking forward to it.",
      "Thanks for sharing! I'll check it out.",
      "Thank you so much! It's been a great day so far.",
      "Just sent it to your email. Let me know if you got it.",
      "That would be awesome! Let me know your dates and we can plan something.",
      "It was an amazing game! I couldn't believe that last-minute goal.",
    ]

    return replies[Math.floor(Math.random() * replies.length)]
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"></div>
            <div className="mt-4 text-gray-400">Loading messages...</div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-8rem)] lg:h-[calc(100vh-2rem)] overflow-hidden rounded-xl border border-gray-700">
        {/* Conversations List */}
        <div className="w-full sm:w-80 border-r border-gray-700 bg-gray-800/80 backdrop-blur-sm flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Messages</h2>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search messages..."
                className="pl-9 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-purple-500"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    activeConversation === conversation.id ? "bg-gray-700" : "hover:bg-gray-700/50"
                  }`}
                  onClick={() => handleConversationChange(conversation.id)}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12 border border-gray-700">
                      <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
                      <AvatarFallback className="bg-gray-700 text-purple-300">
                        {conversation.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-700"></span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-white truncate">{conversation.user.name}</div>
                      <div className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(conversation.lastMessage.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                    <div className="text-sm truncate text-gray-400 max-w-[180px]">
                      {conversation.lastMessage.senderId === user?.id ? "You: " : ""}
                      {conversation.lastMessage.content}
                    </div>
                  </div>
                  {conversation.unread > 0 && (
                    <div className="w-5 h-5 rounded-full bg-teal-500 text-white text-xs flex items-center justify-center animate-pulse">
                      {conversation.unread}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="hidden sm:flex flex-1 flex-col bg-gray-900">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 border border-gray-700">
                    <AvatarImage
                      src={conversations.find((c) => c.id === activeConversation)?.user.avatar}
                      alt={conversations.find((c) => c.id === activeConversation)?.user.name}
                    />
                    <AvatarFallback className="bg-gray-700 text-purple-300">
                      {conversations.find((c) => c.id === activeConversation)?.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-white">
                      {conversations.find((c) => c.id === activeConversation)?.user.name}
                    </div>
                    <div className="text-xs text-green-400">Online</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full"
                  >
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full"
                  >
                    <Video className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  <AnimatePresence initial={false}>
                    {messages.map((message, index) => {
                      const isFromUser = message.senderId === user?.id
                      const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId

                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`flex ${isFromUser ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`flex ${isFromUser ? "flex-row-reverse" : "flex-row"} items-end space-x-2 ${isFromUser ? "space-x-reverse" : ""}`}
                          >
                            {!isFromUser && showAvatar ? (
                              <Avatar className="h-8 w-8 border border-gray-700">
                                <AvatarImage
                                  src={conversations.find((c) => c.id === activeConversation)?.user.avatar}
                                  alt={conversations.find((c) => c.id === activeConversation)?.user.name}
                                />
                                <AvatarFallback className="bg-gray-700 text-purple-300">
                                  {conversations.find((c) => c.id === activeConversation)?.user.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="w-8" />
                            )}
                            <div>
                              <div
                                className={`px-4 py-2 rounded-2xl ${
                                  isFromUser
                                    ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white"
                                    : "bg-gray-800 text-white"
                                }`}
                              >
                                {message.content}
                              </div>
                              <div className={`text-xs mt-1 text-gray-500 ${isFromUser ? "text-right" : "text-left"}`}>
                                {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-700">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500"
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white transition-all duration-300"
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
                  <Send className="h-10 w-10 text-gray-600" />
                </div>
                <h3 className="text-xl font-medium text-white">Your Messages</h3>
                <p className="text-gray-400 max-w-md">
                  Select a conversation from the sidebar or start a new message to begin chatting.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}

