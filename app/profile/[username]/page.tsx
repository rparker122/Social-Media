"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { MainLayout } from "@/components/main-layout"
import { PostCard } from "@/components/post-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import type { User, Post } from "@/lib/types"
import { getCurrentUser, followUser, unfollowUser } from "@/lib/auth"
import { getUserPosts } from "@/lib/posts"
import { sampleUsers } from "@/lib/sample-data"
import { useToast } from "@/hooks/use-toast"

interface ProfilePageProps {
  params: {
    username: string
  }
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { username } = params
  const [user, setUser] = useState<User | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        const loggedInUser = await getCurrentUser()
        if (!loggedInUser) {
          router.push("/login")
          return
        }

        setCurrentUser(loggedInUser)

        // Find user by username
        // In a real app, this would be an API call
        let profileUser: User | null = null

        if (loggedInUser.username === username) {
          profileUser = loggedInUser
        } else {
          profileUser = sampleUsers.find((u) => u.username === username) || null
        }

        if (!profileUser) {
          toast({
            title: "User not found",
            description: "The user you're looking for doesn't exist",
            variant: "destructive",
          })
          router.push("/feed")
          return
        }

        setUser(profileUser)

        // Check if current user is following this user
        // In a real app, this would be determined by the API
        setIsFollowing(Math.random() > 0.5)

        // Get user posts
        const userPosts = await getUserPosts(profileUser.id)
        setPosts(userPosts)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [username, router, toast])

  const handleFollowToggle = async () => {
    if (!user) return

    try {
      if (isFollowing) {
        await unfollowUser(user.id)
        toast({
          title: "Unfollowed",
          description: `You are no longer following ${user.name}`,
        })
      } else {
        await followUser(user.id)
        toast({
          title: "Following",
          description: `You are now following ${user.name}`,
        })
      }

      setIsFollowing(!isFollowing)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      })
    }
  }

  if (isLoading || !user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"></div>
            <div className="mt-4 text-gray-400">Loading profile...</div>
          </div>
        </div>
      </MainLayout>
    )
  }

  const isOwnProfile = currentUser?.id === user.id

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden mb-6">
          {/* Cover Photo */}
          <div className="h-40 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 relative">
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6 relative">
            <div className="flex justify-between">
              <div className="relative -mt-12">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 p-1"></div>
                <div className="relative h-24 w-24 rounded-full border-4 border-gray-800 overflow-hidden">
                  <Image src={user.avatar || "/placeholder.svg"} alt={user.name} fill className="object-cover" />
                </div>
              </div>

              {!isOwnProfile && (
                <div className="mt-4">
                  <Button
                    className={
                      isFollowing
                        ? "bg-gray-700 hover:bg-gray-600 text-white"
                        : "bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white"
                    }
                    onClick={handleFollowToggle}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-4">
              <h1 className="text-2xl font-bold text-white">{user.name}</h1>
              <p className="text-gray-400">@{user.username}</p>

              {user.bio && <p className="mt-3 text-white">{user.bio}</p>}

              <div className="flex space-x-4 mt-4">
                <div>
                  <span className="font-bold text-white">{user.posts}</span>
                  <span className="text-gray-400 ml-1">Posts</span>
                </div>
                <div>
                  <span className="font-bold text-white">{user.followers}</span>
                  <span className="text-gray-400 ml-1">Followers</span>
                </div>
                <div>
                  <span className="font-bold text-white">{user.following}</span>
                  <span className="text-gray-400 ml-1">Following</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <Tabs defaultValue="posts" className="mb-6">
          <TabsList className="bg-gray-800 mb-6">
            <TabsTrigger
              value="posts"
              className="flex-1 data-[state=active]:bg-gray-700 data-[state=active]:text-cyan-400"
            >
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="media"
              className="flex-1 data-[state=active]:bg-gray-700 data-[state=active]:text-cyan-400"
            >
              Media
            </TabsTrigger>
            <TabsTrigger
              value="likes"
              className="flex-1 data-[state=active]:bg-gray-700 data-[state=active]:text-cyan-400"
            >
              Likes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-0">
            <div className="space-y-6">
              {posts.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/50 rounded-lg border border-gray-700">
                  <p className="text-gray-400">No posts yet</p>
                  {isOwnProfile && <p className="text-gray-500 text-sm mt-1">Create your first post to get started</p>}
                </div>
              ) : (
                posts.map((post) => <PostCard key={post.id} post={post} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="media" className="mt-0">
            <div className="grid grid-cols-3 gap-1">
              {posts
                .filter((post) => post.images && post.images.length > 0)
                .flatMap((post) => post.images || [])
                .map((image, index) => (
                  <div key={index} className="aspect-square relative bg-gray-700 rounded-md overflow-hidden">
                    <Image src={image || "/placeholder.svg"} alt={`Media ${index + 1}`} fill className="object-cover" />
                  </div>
                ))}

              {posts.filter((post) => post.images && post.images.length > 0).length === 0 && (
                <div className="col-span-3 text-center py-12 bg-gray-800/50 rounded-lg border border-gray-700">
                  <p className="text-gray-400">No media posts yet</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="likes" className="mt-0">
            <div className="space-y-6">
              {posts
                .filter((post) => post.isLiked)
                .map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}

              {posts.filter((post) => post.isLiked).length === 0 && (
                <div className="text-center py-12 bg-gray-800/50 rounded-lg border border-gray-700">
                  <p className="text-gray-400">No liked posts yet</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}

