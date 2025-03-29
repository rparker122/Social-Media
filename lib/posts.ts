import type { Post, Comment } from "@/lib/types"
import { getCurrentUser } from "@/lib/auth"
import { sampleUsers } from "@/lib/sample-data"

// In-memory storage for posts
let posts: Post[] = []
let comments: Record<string, Comment[]> = {}

// Initialize with sample data
export async function initializePosts() {
  if (posts.length > 0) return

  const currentUser = await getCurrentUser()

  // Generate sample posts
  posts = [
    {
      id: "1",
      content:
        "Just launched my new portfolio website! Check it out and let me know what you think. #webdev #portfolio",
      author: sampleUsers[0],
      images: ["/placeholder.svg?height=400&width=600&text=Portfolio+Website"],
      likes: 42,
      comments: 7,
      isLiked: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "2",
      content:
        "Excited to announce that I've joined the team at Prism Social as a Senior Developer! Looking forward to building amazing features for all of you. #newjob #career",
      author: sampleUsers[1],
      likes: 128,
      comments: 24,
      isLiked: true,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "3",
      content:
        "Just hiked to the top of Mount Rainier! The view is absolutely breathtaking. #nature #hiking #mountains",
      author: sampleUsers[2],
      images: [
        "/placeholder.svg?height=400&width=600&text=Mountain+View",
        "/placeholder.svg?height=400&width=600&text=Sunset",
      ],
      likes: 89,
      comments: 12,
      isLiked: false,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "4",
      content:
        "Working on a new AI project that will revolutionize how we interact with technology. Stay tuned for updates! #AI #tech #innovation",
      author: sampleUsers[3],
      likes: 56,
      comments: 8,
      isLiked: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "5",
      content:
        "Just finished reading 'The Midnight Library' by Matt Haig. Highly recommend it to anyone looking for a thought-provoking read about life's possibilities. #books #reading",
      author: sampleUsers[4],
      images: ["/placeholder.svg?height=400&width=600&text=Book+Cover"],
      likes: 73,
      comments: 15,
      isLiked: false,
      createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    },
  ]

  // Generate sample comments
  comments = {
    "1": [
      {
        id: "101",
        content: "This looks amazing! Great work!",
        author: sampleUsers[1],
        likes: 5,
        isLiked: true,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "102",
        content: "Love the design! What tech stack did you use?",
        author: sampleUsers[2],
        likes: 3,
        isLiked: false,
        createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      },
    ],
    "2": [
      {
        id: "201",
        content: "Congratulations! So happy for you!",
        author: sampleUsers[0],
        likes: 7,
        isLiked: true,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
    ],
  }

  // If current user exists, add a post from them
  if (currentUser) {
    posts.unshift({
      id: "0",
      content: "Just joined Prism Social! Excited to connect with everyone here. #newuser #hello",
      author: currentUser,
      likes: 3,
      comments: 1,
      isLiked: false,
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    })

    comments["0"] = [
      {
        id: "001",
        content: "Welcome to Prism Social! You're going to love it here.",
        author: sampleUsers[0],
        likes: 1,
        isLiked: false,
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
    ]
  }
}

export async function getFeedPosts(): Promise<Post[]> {
  await initializePosts()
  return [...posts]
}

export async function getUserPosts(userId: string): Promise<Post[]> {
  await initializePosts()
  return posts.filter((post) => post.author.id === userId)
}

export async function getPost(postId: string): Promise<Post | null> {
  await initializePosts()
  return posts.find((post) => post.id === postId) || null
}

export async function createPost(content: string, images?: string[]): Promise<Post> {
  const currentUser = await getCurrentUser()
  if (!currentUser) throw new Error("User not authenticated")

  // Create new post
  const newPost: Post = {
    id: Date.now().toString(),
    content,
    author: currentUser,
    images,
    likes: 0,
    comments: 0,
    isLiked: false,
    createdAt: new Date().toISOString(),
  }

  // Add to posts
  posts.unshift(newPost)

  // Update user's post count
  currentUser.posts += 1
  localStorage.setItem("user", JSON.stringify(currentUser))

  return newPost
}

export async function likePost(postId: string): Promise<void> {
  const currentUser = await getCurrentUser()
  if (!currentUser) throw new Error("User not authenticated")

  const post = posts.find((p) => p.id === postId)
  if (!post) throw new Error("Post not found")

  if (!post.isLiked) {
    post.likes += 1
    post.isLiked = true
  }
}

export async function unlikePost(postId: string): Promise<void> {
  const currentUser = await getCurrentUser()
  if (!currentUser) throw new Error("User not authenticated")

  const post = posts.find((p) => p.id === postId)
  if (!post) throw new Error("Post not found")

  if (post.isLiked) {
    post.likes = Math.max(0, post.likes - 1)
    post.isLiked = false
  }
}

export async function getComments(postId: string): Promise<Comment[]> {
  await initializePosts()
  return comments[postId] || []
}

export async function addComment(postId: string, content: string): Promise<Comment> {
  const currentUser = await getCurrentUser()
  if (!currentUser) throw new Error("User not authenticated")

  const post = posts.find((p) => p.id === postId)
  if (!post) throw new Error("Post not found")

  // Create new comment
  const newComment: Comment = {
    id: Date.now().toString(),
    content,
    author: currentUser,
    likes: 0,
    isLiked: false,
    createdAt: new Date().toISOString(),
  }

  // Initialize comments array for post if it doesn't exist
  if (!comments[postId]) {
    comments[postId] = []
  }

  // Add comment
  comments[postId].unshift(newComment)

  // Update post comment count
  post.comments += 1

  return newComment
}

