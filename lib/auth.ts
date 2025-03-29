import type { User } from "@/lib/types"

// In a real app, this would be a database call
// For demo purposes, we'll use localStorage
export async function loginUser(username: string, password: string): Promise<User> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // For demo purposes, accept any username/password
  // In a real app, you would validate credentials against a database
  if (username && password) {
    const user: User = {
      id: "1",
      name: username === "demo" ? "Demo User" : username,
      username: username,
      email: `${username}@example.com`,
      avatar: `/placeholder.svg?height=100&width=100&text=${username.charAt(0).toUpperCase()}`,
      bio: "This is a demo user account",
      followers: 120,
      following: 85,
      posts: 42,
      createdAt: new Date().toISOString(),
    }

    // Store user in localStorage
    localStorage.setItem("user", JSON.stringify(user))

    return user
  }

  throw new Error("Invalid credentials")
}

export async function registerUser(name: string, username: string, email: string, password: string): Promise<User> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // For demo purposes, accept any registration
  // In a real app, you would validate and store in a database
  if (name && username && email && password) {
    const user: User = {
      id: Date.now().toString(),
      name,
      username,
      email,
      avatar: `/placeholder.svg?height=100&width=100&text=${name.charAt(0).toUpperCase()}`,
      bio: "",
      followers: 0,
      following: 0,
      posts: 0,
      createdAt: new Date().toISOString(),
    }

    // Store user in localStorage
    localStorage.setItem("user", JSON.stringify(user))

    return user
  }

  throw new Error("Invalid registration data")
}

export async function getCurrentUser(): Promise<User | null> {
  // In a real app, this would validate a session token
  // For demo purposes, we'll just check localStorage

  if (typeof window === "undefined") {
    return null
  }

  const userJson = localStorage.getItem("user")
  if (!userJson) return null

  return JSON.parse(userJson) as User
}

export async function logoutUser(): Promise<void> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Remove user from localStorage
  localStorage.removeItem("user")
}

export async function followUser(userId: string): Promise<void> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  // In a real app, this would update a database
  // For demo purposes, we'll just update the current user's following count
  const userJson = localStorage.getItem("user")
  if (!userJson) return

  const user = JSON.parse(userJson) as User
  user.following += 1

  localStorage.setItem("user", JSON.stringify(user))
}

export async function unfollowUser(userId: string): Promise<void> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  // In a real app, this would update a database
  // For demo purposes, we'll just update the current user's following count
  const userJson = localStorage.getItem("user")
  if (!userJson) return

  const user = JSON.parse(userJson) as User
  user.following = Math.max(0, user.following - 1)

  localStorage.setItem("user", JSON.stringify(user))
}

