"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Image, X, Smile } from "lucide-react"
import type { User, Post } from "@/lib/types"
import { createPost } from "@/lib/posts"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"

interface CreatePostCardProps {
  user: User
  onPostCreated?: (post: Post) => void
}

export function CreatePostCard({ user, onPostCreated }: CreatePostCardProps) {
  const [content, setContent] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) return

    setIsSubmitting(true)

    try {
      const post = await createPost(content, images.length > 0 ? images : undefined)

      setContent("")
      setImages([])

      toast({
        title: "Post created",
        description: "Your post has been published successfully",
      })

      if (onPostCreated) {
        onPostCreated(post)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // For demo purposes, we'll just use placeholder images
    // In a real app, you would upload these to a server
    const newImages = Array.from(files).map(
      (_, index) => `/placeholder.svg?height=400&width=600&text=Image+${images.length + index + 1}`,
    )

    setImages((prev) => [...prev, ...newImages])

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex space-x-3">
          <Avatar className="h-10 w-10 border border-gray-700">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-gray-700 text-purple-300">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`What's on your mind, ${user.name.split(" ")[0]}?`}
              className="min-h-[100px] bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-purple-500 resize-none"
            />

            {/* Image Preview */}
            <AnimatePresence>
              {images.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 grid grid-cols-2 gap-2"
                >
                  {images.map((image, index) => (
                    <div key={index} className="relative rounded-lg overflow-hidden aspect-video bg-gray-700">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-gray-900/80 text-white p-1 rounded-full"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between mt-3">
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-cyan-400 hover:bg-gray-700"
                  onClick={handleImageUpload}
                >
                  <Image className="h-5 w-5 mr-1" />
                  <span>Image</span>
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-amber-400 hover:bg-gray-700"
                >
                  <Smile className="h-5 w-5 mr-1" />
                  <span>Emoji</span>
                </Button>
              </div>

              <Button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white transition-all duration-300"
              >
                {isSubmitting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

