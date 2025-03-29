"use client"

import { useEffect, useRef } from "react"

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Create gradient points
    const gradientPoints = Array.from({ length: 5 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 200 + 100,
      color: getRandomColor(),
      targetColor: getRandomColor(),
      colorStep: 0,
      colorChangeSpeed: 0.005,
    }))

    function getRandomColor() {
      const colors = [
        [20, 184, 166], // Teal-500
        [6, 182, 212], // Cyan-500
        [14, 165, 233], // Sky-500
        [59, 130, 246], // Blue-500
        [245, 158, 11], // Amber-500
        [249, 115, 22], // Orange-500
        [16, 185, 129], // Emerald-500
        [5, 150, 105], // Emerald-600
      ]
      return colors[Math.floor(Math.random() * colors.length)]
    }

    function lerpColor(color1: number[], color2: number[], t: number) {
      return [
        Math.round(color1[0] + (color2[0] - color1[0]) * t),
        Math.round(color1[1] + (color2[1] - color1[1]) * t),
        Math.round(color1[2] + (color2[2] - color1[2]) * t),
      ]
    }

    function animate() {
      // Clear canvas with a dark background
      ctx.fillStyle = "rgba(17, 24, 39, 1)" // Dark background
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw gradient blobs
      gradientPoints.forEach((point) => {
        // Move the point
        point.x += point.vx
        point.y += point.vy

        // Bounce off edges
        if (point.x < 0 || point.x > canvas.width) point.vx *= -1
        if (point.y < 0 || point.y > canvas.height) point.vy *= -1

        // Update color
        point.colorStep += point.colorChangeSpeed
        if (point.colorStep >= 1) {
          point.color = point.targetColor
          point.targetColor = getRandomColor()
          point.colorStep = 0
        }

        const currentColor = lerpColor(point.color, point.targetColor, point.colorStep)

        // Create radial gradient
        const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, point.radius)

        gradient.addColorStop(0, `rgba(${currentColor[0]}, ${currentColor[1]}, ${currentColor[2]}, 0.3)`)
        gradient.addColorStop(1, `rgba(${currentColor[0]}, ${currentColor[1]}, ${currentColor[2]}, 0)`)

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" style={{ opacity: 0.7 }} />
}

