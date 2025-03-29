import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserPlus, LogIn, TrendingUp, Users, MessageSquare } from "lucide-react"
import { AnimatedBackground } from "@/components/animated-background"
import { FeatureCard } from "@/components/feature-card"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <AnimatedBackground />

      <main className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight animate-text bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
              Prism Social
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Connect with friends and the world around you with vibrant, colorful experiences.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link href="/register">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white transition-all duration-300 shadow-glow-teal"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Sign Up
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto bg-gray-800/50 border-gray-700 hover:bg-gray-700 hover:text-cyan-300 text-white transition-all duration-300"
              >
                <LogIn className="mr-2 h-5 w-5 text-cyan-400" />
                Log In
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8 text-teal-400" />}
              title="Discover Trends"
              description="Stay updated with the latest trends and topics from around the world."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8 text-cyan-400" />}
              title="Connect with Friends"
              description="Build your network and stay connected with friends and family."
            />
            <FeatureCard
              icon={<MessageSquare className="h-8 w-8 text-blue-400" />}
              title="Join Conversations"
              description="Engage in meaningful conversations about topics you care about."
            />
          </div>

          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-blue-500/20 rounded-xl blur-xl"></div>
            <div className="relative bg-gray-800/80 backdrop-blur-sm p-8 rounded-xl border border-gray-700">
              <h2 className="text-2xl font-bold mb-4">Why Choose Prism Social?</h2>
              <p className="text-gray-300 mb-6">
                Prism Social is designed with vibrant colors and smooth animations to make your social experience more
                engaging and enjoyable. We prioritize user experience, privacy, and meaningful connections.
              </p>
              <div className="flex justify-center">
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white transition-all duration-300">
                    Get Started Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

