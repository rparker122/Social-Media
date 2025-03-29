"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageSquare, Share2, MoreHorizontal, Bookmark } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Post } from "@/lib/types"
import { likePost, unlikePost } from "@/lib/posts"
import { CommentSection } from "@/components/comment-section"
import { motion, AnimatePresence } from "framer-motion"

interface PostCardProps {
  post: Post
  onPostUpdated?: (post: Post) => void
}

export function PostCard({ post, onPostUpdated }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [likeCount, setLikeCount] = useState(post.likes)
  const [showComments, setShowComments] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const handleLikeToggle = async () => {
    try {
      if (isLiked) {
        await unlikePost(post.id)
        setLikeCount((prev) => Math.max(0, prev - 1))
      } else {
        await likePost(post.id)
        setLikeCount((prev) => prev + 1)
      }

      setIsLiked(!isLiked)

      if (onPostUpdated) {
        onPostUpdated({
          ...post,
          isLiked: !isLiked,
          likes: isLiked ? Math.max(0, post.likes - 1) : post.likes + 1,
        })
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  const handleSaveToggle = () => {
    setIsSaved(!isSaved)
  }

  const handleCommentToggle = () => {
    setShowComments(!showComments)
  }

  return (
    <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <Link href={`/profile/${post.author.username}`} className="flex items-center space-x-3 group">
          <Avatar className="h-10 w-10 border border-gray-700 transition-transform group-hover:scale-105">
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback className="bg-gray-700 text-purple-300">{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-white group-hover:text-purple-400 transition-colors">
              {post.author.name}
            </div>
            <div className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </div>
          </div>
        </Link>

        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-700 rounded-full">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-white whitespace-pre-line">{post.content}</p>
      </div>

      {/* Post Images */}
      {post.images && post.images.length > 0 && (
        <div className={`grid ${post.images.length > 1 ? "grid-cols-2 gap-1" : "grid-cols-1"}`}>
          {post.images.map((image, index) => (
            <div key={index} className="relative aspect-video">
              <Image src={image || "/placeholder.svg"} alt={`Post image ${index + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Post Actions */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-gray-700">
        <div className="flex items-center space-x-6">
          <motion.button
            className={`flex items-center space-x-1 ${isLiked ? "text-orange-500 hover:text-orange-600" : "hover:text-orange-500"}`}
            onClick={handleLikeToggle}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
            <span className={isLiked ? "text-red-500" : ""}>{likeCount}</span>
          </motion.button>

          <button className="flex items-center space-x-1 hover:text-cyan-500" onClick={handleCommentToggle}>
            <MessageSquare className="h-5 w-5" />
            <span>{post.comments}</span>
          </button>

          <button className="flex items-center space-x-1 hover:text-teal-500 ml-auto">
            <Share2 className="h-5 w-5" />
          </button>
        </div>

        <motion.button
          className="text-gray-400 hover:text-yellow-500 transition-colors"
          onClick={handleSaveToggle}
          whileTap={{ scale: 0.9 }}
        >
          <Bookmark className={`h-5 w-5 ${isSaved ? "fill-yellow-500 text-yellow-500" : ""}`} />
        </motion.button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-700 overflow-hidden"
          >
            <CommentSection postId={post.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

