"use client"

import { useEffect, useRef } from "react"
import { useRatings } from "@/lib/api"

export default function RatingGauge() {
  const { data: rating } = useRatings()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || rating === undefined) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = 200
    canvas.height = 120

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const centerX = canvas.width / 2
    const centerY = canvas.height
    const radius = Math.min(centerX, centerY) * 0.9

    // Draw background arc
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI, 0)
    ctx.lineWidth = 15
    ctx.strokeStyle = "#e5e7eb"
    ctx.stroke()

    // Draw rating arc
    const ratingPercentage = rating / 5
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI, Math.PI - Math.PI * ratingPercentage)
    ctx.lineWidth = 15
    ctx.strokeStyle = "#00C2CB"
    ctx.stroke()
  }, [rating, canvasRef])

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} width="200" height="120"></canvas>
      <div className="text-center mt-2">
        <div className="flex items-center justify-center">
          <span className="text-3xl font-bold">{rating?.toFixed(1)}</span>
          <span className="text-xl text-gray-400 ml-1">/5</span>
        </div>
      </div>
    </div>
  )
}

