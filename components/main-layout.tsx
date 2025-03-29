"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Home, Search, Bell, User, LogOut, PlusCircle, MessageSquare, Menu, X } from "lucide-react"
import { AnimatedBackground } from "@/components/animated-background"
import type { User as UserType } from "@/lib/types"
import { getCurrentUser, logoutUser } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [user, setUser] = useState<UserType | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/login")
        return
      }

      setUser(currentUser)
    }

    loadUser()
  }, [router])

  const handleLogout = async () => {
    await logoutUser()
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    })
    router.push("/login")
  }

  const navItems = [
    { icon: <Home className="h-6 w-6" />, label: "Home", href: "/feed" },
    { icon: <Search className="h-6 w-6" />, label: "Explore", href: "/explore" },
    { icon: <Bell className="h-6 w-6" />, label: "Notifications", href: "/notifications" },
    { icon: <MessageSquare className="h-6 w-6" />, label: "Messages", href: "/messages" },
    { icon: <User className="h-6 w-6" />, label: "Profile", href: `/profile/${user?.username}` },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <AnimatedBackground />

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 z-20 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/feed" className="flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
              Prism
            </span>
          </Link>

          <div className="flex items-center space-x-3">
            <Link href="/create">
              <Button size="icon" variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">
                <PlusCircle className="h-5 w-5" />
              </Button>
            </Link>

            <Button
              size="icon"
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-gray-900/95 z-10 pt-16 px-4 pb-4">
          <div className="flex flex-col h-full">
            <div className="flex-1">
              <div className="py-4 border-b border-gray-800">
                {user && (
                  <div className="flex items-center space-x-3 p-2">
                    <Avatar className="h-12 w-12 border border-gray-700">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-gray-700 text-cyan-300">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-white">{user.name}</div>
                      <div className="text-sm text-gray-400">@{user.username}</div>
                    </div>
                  </div>
                )}
              </div>

              <nav className="py-4">
                <ul className="space-y-1">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                          pathname === item.href
                            ? "bg-gray-800 text-cyan-400"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className="pt-4 border-t border-gray-800">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-3" />
                Log Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-10 lg:w-64 lg:flex-col lg:border-r lg:border-gray-800 lg:bg-gray-900/80 lg:backdrop-blur-md">
        <div className="flex flex-col h-full px-4 py-6">
          <div className="mb-8 px-2">
            <Link href="/feed" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
                Prism Social
              </span>
            </Link>
          </div>

          <nav className="flex-1">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                      pathname === item.href
                        ? "bg-gray-800 text-cyan-400"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-6">
            <Button
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white transition-all duration-300"
              onClick={() => router.push("/create")}
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              New Post
            </Button>

            {user && (
              <div className="flex items-center space-x-3 mt-6 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                <Avatar className="h-10 w-10 border border-gray-700">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-gray-700 text-cyan-300">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">{user.name}</div>
                  <div className="text-xs text-gray-400 truncate">@{user.username}</div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md border-t border-gray-800 z-10">
        <nav className="flex justify-around">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-3 px-2 ${
                pathname === item.href ? "text-cyan-400" : "text-gray-400 hover:text-white"
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 pt-16 lg:pt-0 pb-20 lg:pb-0">
        <div className="container mx-auto px-4 py-6">{children}</div>
      </div>
    </div>
  )
}

