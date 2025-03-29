export interface User {
  id: string
  name: string
  username: string
  email: string
  avatar: string
  bio: string
  followers: number
  following: number
  posts: number
  createdAt: string
}

export interface Post {
  id: string
  content: string
  author: User
  images?: string[]
  likes: number
  comments: number
  isLiked: boolean
  createdAt: string
}

export interface Comment {
  id: string
  content: string
  author: User
  likes: number
  isLiked: boolean
  createdAt: string
}

export interface Notification {
  id: string
  type: "like" | "comment" | "follow" | "mention"
  actor: User
  post?: Post
  comment?: Comment
  read: boolean
  createdAt: string
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  text: string
  timestamp: Date
  status: "sent" | "delivered" | "read"
}

export interface Conversation {
  id: string
  user: User
  lastMessage: Message
  unread: number
}

