"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageSquare, UserPlus, AtSign } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { User, Notification } from "@/lib/types"
import { getCurrentUser } from "@/lib/auth"
import { sampleUsers } from "@/lib/sample-data"
import { motion } from "framer-motion"

export default function NotificationsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
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

        // Generate sample notifications
        // In a real app, this would be an API call
        const sampleNotifications: Notification[] = [
          {
            id: "1",
            type: "like",
            actor: sampleUsers[0],
            post: {
              id: "101",
              content: "Just joined Prism Social! Excited to connect with everyone here.",
              author: currentUser,
              likes: 5,
              comments: 2,
              isLiked: false,
              createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            },
            read: false,
            createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "2",
            type: "comment",
            actor: sampleUsers[1],
            post: {
              id: "101",
              content: "Just joined Prism Social! Excited to connect with everyone here.",
              author: currentUser,
              likes: 5,
              comments: 2,
              isLiked: false,
              createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            },
            comment: {
              id: "201",
              content: "Welcome to Prism Social! You're going to love it here.",
              author: sampleUsers[1],
              likes: 1,
              isLiked: false,
              createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
            },
            read: true,
            createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "3",
            type: "follow",
            actor: sampleUsers[2],
            read: false,
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "4",
            type: "mention",
            actor: sampleUsers[3],
            post: {
              id: "102",
              content: `Hey @${currentUser.username}, check out this new feature I found!`,
              author: sampleUsers[3],
              likes: 3,
              comments: 1,
              isLiked: false,
              createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            },
            read: true,
            createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "5",
            type: "like",
            actor: sampleUsers[4],
            post: {
              id: "103",
              content: "Just posted my first photo on Prism Social!",
              author: currentUser,
              images: ["/placeholder.svg?height=400&width=600&text=First+Post"],
              likes: 8,
              comments: 3,
              isLiked: false,
              createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            },
            read: true,
            createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
          },
        ]

        setNotifications(sampleNotifications)
      } catch (error) {
        console.error("Error loading notifications:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router])

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-5 w-5 text-red-500" />
      case "comment":
        return <MessageSquare className="h-5 w-5 text-blue-500" />
      case "follow":
        return <UserPlus className="h-5 w-5 text-green-500" />
      case "mention":
        return <AtSign className="h-5 w-5 text-yellow-500" />
      default:
        return null
    }
  }

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case "like":
        return (
          <>
            <span className="font-medium text-white">{notification.actor.name}</span>
            <span className="text-gray-300"> liked your post</span>
          </>
        )
      case "comment":
        return (
          <>
            <span className="font-medium text-white">{notification.actor.name}</span>
            <span className="text-gray-300"> commented on your post: </span>
            <span className="text-gray-400">"{notification.comment?.content}"</span>
          </>
        )
      case "follow":
        return (
          <>
            <span className="font-medium text-white">{notification.actor.name}</span>
            <span className="text-gray-300"> started following you</span>
          </>
        )
      case "mention":
        return (
          <>
            <span className="font-medium text-white">{notification.actor.name}</span>
            <span className="text-gray-300"> mentioned you in a post</span>
          </>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"></div>
            <div className="mt-4 text-gray-400">Loading notifications...</div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <Button
            variant="outline"
            size="sm"
            className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300"
            onClick={markAllAsRead}
          >
            Mark all as read
          </Button>
        </div>

        <div className="space-y-1">
          {notifications.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/50 rounded-lg border border-gray-700">
              <p className="text-gray-400">No notifications yet</p>
              <p className="text-gray-500 text-sm mt-1">When someone interacts with you, you'll see it here</p>
            </div>
          ) : (
            notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center p-4 rounded-lg ${
                  notification.read ? "bg-gray-800/50" : "bg-gray-800/80 border-l-4 border-teal-500"
                }`}
                onClick={() => {
                  // Mark as read
                  setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))

                  // Navigate based on notification type
                  if (notification.post) {
                    // In a real app, navigate to the post
                    console.log(`Navigate to post: ${notification.post.id}`)
                  } else if (notification.type === "follow") {
                    router.push(`/profile/${notification.actor.username}`)
                  }
                }}
              >
                <div className="mr-4 p-2 rounded-full bg-gray-700/50">{getNotificationIcon(notification.type)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start">
                    <Avatar className="h-10 w-10 mr-3 border border-gray-700">
                      <AvatarImage src={notification.actor.avatar} alt={notification.actor.name} />
                      <AvatarFallback className="bg-gray-700 text-cyan-300">
                        {notification.actor.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{getNotificationText(notification)}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  {notification.post && (
                    <div className="mt-2 ml-13 p-3 rounded bg-gray-700/50 text-sm text-gray-300 line-clamp-2">
                      {notification.post.content}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  )
}

