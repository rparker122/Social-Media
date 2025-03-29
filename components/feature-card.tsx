"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="relative p-6 rounded-xl overflow-hidden"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl z-0"></div>

      {/* Animated border */}
      <div className="absolute inset-0 rounded-xl z-0 overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 rounded-xl opacity-0 transition-opacity duration-300 ${isHovered ? "opacity-100" : ""}`}
          style={{ margin: "-2px" }}
        ></div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center space-y-4">
        <div className="p-3 rounded-full bg-gray-800/80 backdrop-blur-sm">{icon}</div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="text-gray-300">{description}</p>
      </div>
    </motion.div>
  )
}

