"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { PostCard } from "@/components/post-card"
import { CreatePostCard } from "@/components/create-post-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Sparkles, TrendingUp } from "lucide-react"
import type { Post, User } from "@/lib/types"
import { getCurrentUser } from "@/lib/auth"
import { getFeedPosts } from "@/lib/posts"
import { useToast } from "@/hooks/use-toast"

export default function FeedPage() {
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          router.push("/login")
          return
        }

        setUser(currentUser)

        const feedPosts = await getFeedPosts()
        setPosts(feedPosts)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load feed",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router, toast])

  const handleNewPost = (newPost: Post) => {
    setPosts((prevPosts) => [newPost, ...prevPosts])
  }

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts((prevPosts) => prevPosts.map((post) => (post.id === updatedPost.id ? updatedPost : post)))
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"></div>
            <div className="mt-4 text-gray-400">Loading feed...</div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <Tabs defaultValue="foryou" className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-gray-800">
              <TabsTrigger value="foryou" className="data-[state=active]:bg-gray-700 data-[state=active]:text-cyan-400">
                <Sparkles className="h-4 w-4 mr-2" />
                For You
              </TabsTrigger>
              <TabsTrigger
                value="trending"
                className="data-[state=active]:bg-gray-700 data-[state=active]:text-cyan-400"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Trending
              </TabsTrigger>
            </TabsList>

            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300"
              onClick={() => {
                setPosts([])
                setIsLoading(true)
                setTimeout(async () => {
                  const feedPosts = await getFeedPosts()
                  setPosts(feedPosts)
                  setIsLoading(false)
                }, 1000)
              }}
            >
              Refresh
            </Button>
          </div>

          <TabsContent value="foryou" className="mt-0">
            {user && <CreatePostCard user={user} onPostCreated={handleNewPost} />}

            <div className="space-y-6 mt-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} onPostUpdated={handlePostUpdate} />
              ))}

              {posts.length === 0 && (
                <div className="text-center py-12 bg-gray-800/50 rounded-lg border border-gray-700">
                  <p className="text-gray-400">No posts to show</p>
                  <p className="text-gray-500 text-sm mt-1">Follow more users to see their posts here</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="trending" className="mt-0">
            <div className="space-y-6">
              {posts
                .sort((a, b) => b.likes - a.likes)
                .slice(0, 5)
                .map((post) => (
                  <PostCard key={post.id} post={post} onPostUpdated={handlePostUpdate} />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}

