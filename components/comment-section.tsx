"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Comment, User } from "@/lib/types"
import { getComments, addComment } from "@/lib/posts"
import { getCurrentUser } from "@/lib/auth"
import { motion } from "framer-motion"

interface CommentSectionProps {
  postId: string
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)

        const postComments = await getComments(postId)
        setComments(postComments)
      } catch (error) {
        console.error("Error loading comments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [postId])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim() || !user) return

    try {
      const comment = await addComment(postId, newComment)
      setComments((prev) => [comment, ...prev])
      setNewComment("")
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  return (
    <div className="p-4">
      {/* Comment Form */}
      {user && (
        <form onSubmit={handleSubmitComment} className="flex items-center space-x-3 mb-4">
          <Avatar className="h-8 w-8 border border-gray-700">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-gray-700 text-cyan-300">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-purple-500"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!newComment.trim()}
            className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"></div>
              <div className="mt-2 text-gray-400 text-sm">Loading comments...</div>
            </div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No comments yet. Be the first to comment!</div>
        ) : (
          comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex space-x-3"
            >
              <Avatar className="h-8 w-8 border border-gray-700 flex-shrink-0">
                <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                <AvatarFallback className="bg-gray-700 text-cyan-300">{comment.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-white">{comment.author.name}</div>
                    <div className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                  <p className="text-gray-200">{comment.content}</p>
                </div>
                <div className="flex items-center space-x-4 mt-1 ml-1">
                  <button className="text-xs text-gray-400 hover:text-red-500 flex items-center space-x-1">
                    <Heart className="h-3 w-3" />
                    <span>{comment.likes}</span>
                  </button>
                  <button className="text-xs text-gray-400 hover:text-cyan-400">Reply</button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

