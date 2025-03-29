"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { MainLayout } from "@/components/main-layout"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Search, TrendingUp, Hash, Users, ImageIcon } from "lucide-react"
import type { User, Post } from "@/lib/types"
import { getCurrentUser, followUser, unfollowUser } from "@/lib/auth"
import { getFeedPosts } from "@/lib/posts"
import { sampleUsers } from "@/lib/sample-data"
import { motion } from "framer-motion"

export default function ExplorePage() {
  const [user, setUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([])
  const [trendingTags, setTrendingTags] = useState<{ tag: string; count: number }[]>([])
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([])
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({})
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

        // Get trending posts
        const posts = await getFeedPosts()
        setTrendingPosts(posts.sort((a, b) => b.likes - a.likes).slice(0, 6))

        // Generate trending tags
        const tags = [
          { tag: "technology", count: 1243 },
          { tag: "photography", count: 982 },
          { tag: "design", count: 879 },
          { tag: "travel", count: 754 },
          { tag: "food", count: 621 },
          { tag: "art", count: 543 },
          { tag: "music", count: 498 },
          { tag: "fitness", count: 412 },
          { tag: "nature", count: 387 },
          { tag: "fashion", count: 356 },
        ]
        setTrendingTags(tags)

        // Get suggested users
        // In a real app, this would be an API call with recommendations
        const suggested = sampleUsers.filter((u) => u.id !== currentUser.id)
        setSuggestedUsers(suggested)

        // Initialize following status
        const status: Record<string, boolean> = {}
        suggested.forEach((u) => {
          status[u.id] = Math.random() > 0.7 // Randomly set some as followed
        })
        setFollowingStatus(status)
      } catch (error) {
        console.error("Error loading explore data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleFollowToggle = async (userId: string) => {
    try {
      if (followingStatus[userId]) {
        await unfollowUser(userId)
      } else {
        await followUser(userId)
      }

      setFollowingStatus((prev) => ({
        ...prev,
        [userId]: !prev[userId],
      }))
    } catch (error) {
      console.error("Error toggling follow status:", error)
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"></div>
            <div className="mt-4 text-gray-400">Loading explore page...</div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
          <Input
            placeholder="Search for people, posts, or tags..."
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Explore Tabs */}
        <Tabs defaultValue="trending" className="mb-6">
          <TabsList className="bg-gray-800 mb-6">
            <TabsTrigger value="trending" className="data-[state=active]:bg-gray-700 data-[state=active]:text-cyan-400">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="tags" className="data-[state=active]:bg-gray-700 data-[state=active]:text-cyan-400">
              <Hash className="h-4 w-4 mr-2" />
              Tags
            </TabsTrigger>
            <TabsTrigger value="people" className="data-[state=active]:bg-gray-700 data-[state=active]:text-cyan-400">
              <Users className="h-4 w-4 mr-2" />
              People
            </TabsTrigger>
            <TabsTrigger value="media" className="data-[state=active]:bg-gray-700 data-[state=active]:text-cyan-400">
              <ImageIcon className="h-4 w-4 mr-2" />
              Media
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trending" className="mt-0">
            <h2 className="text-xl font-bold text-white mb-4">Trending Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trendingPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden cursor-pointer"
                  onClick={() => {
                    // In a real app, navigate to post detail
                    console.log(`Navigate to post: ${post.id}`)
                  }}
                >
                  {post.images && post.images.length > 0 && (
                    <div className="relative h-40">
                      <Image
                        src={post.images[0] || "/placeholder.svg"}
                        alt="Post image"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <Avatar className="h-8 w-8 border border-gray-700">
                        <AvatarImage src={post.author.avatar} alt={post.author.name} />
                        <AvatarFallback className="bg-gray-700 text-purple-300">
                          {post.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm font-medium text-white">{post.author.name}</div>
                    </div>
                    <p className="text-gray-300 line-clamp-2">{post.content}</p>
                    <div className="flex items-center justify-between mt-3 text-sm text-gray-400">
                      <div>{post.likes} likes</div>
                      <div>{post.comments} comments</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tags" className="mt-0">
            <h2 className="text-xl font-bold text-white mb-4">Trending Tags</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {trendingTags.map((tag, index) => (
                <motion.div
                  key={tag.tag}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700 p-4 cursor-pointer hover:border-teal-500 transition-colors"
                  onClick={() => {
                    // In a real app, navigate to tag page
                    console.log(`Navigate to tag: ${tag.tag}`)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-medium text-white">#{tag.tag}</div>
                      <div className="text-sm text-gray-400">{tag.count} posts</div>
                    </div>
                    <Hash className="h-6 w-6 text-cyan-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="people" className="mt-0">
            <h2 className="text-xl font-bold text-white mb-4">Suggested People</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestedUsers.map((suggestedUser, index) => (
                <motion.div
                  key={suggestedUser.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700 p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12 border border-gray-700">
                      <AvatarImage src={suggestedUser.avatar} alt={suggestedUser.name} />
                      <AvatarFallback className="bg-gray-700 text-purple-300">
                        {suggestedUser.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div
                        className="font-medium text-white hover:text-cyan-400 cursor-pointer"
                        onClick={() => router.push(`/profile/${suggestedUser.username}`)}
                      >
                        {suggestedUser.name}
                      </div>
                      <div className="text-sm text-gray-400">@{suggestedUser.username}</div>
                    </div>
                  </div>
                  <Button
                    variant={followingStatus[suggestedUser.id] ? "outline" : "default"}
                    size="sm"
                    className={
                      followingStatus[suggestedUser.id]
                        ? "bg-gray-700 hover:bg-gray-600 text-white"
                        : "bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white"
                    }
                    onClick={() => handleFollowToggle(suggestedUser.id)}
                  >
                    {followingStatus[suggestedUser.id] ? "Following" : "Follow"}
                  </Button>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="media" className="mt-0">
            <h2 className="text-xl font-bold text-white mb-4">Popular Media</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {trendingPosts
                .filter((post) => post.images && post.images.length > 0)
                .flatMap((post) => post.images || [])
                .map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="aspect-square relative bg-gray-700 rounded-md overflow-hidden cursor-pointer"
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Media ${index + 1}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </motion.div>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}

