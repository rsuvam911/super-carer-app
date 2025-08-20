"use client"

import { useClientDistribution } from "@/lib/api"
import { useEffect, useRef } from "react"

export default function DonutChart() {
  const { data: distribution } = useClientDistribution()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !distribution) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = 200
    canvas.height = 200

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Calculate total
    const total = distribution.elderlyCare + distribution.childrenCare + distribution.disabilityCare

    // Draw donut chart
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) * 0.8
    const innerRadius = radius * 0.6

    // Draw segments
    const drawSegment = (startAngle: number, endAngle: number, color: string) => {
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true)
      ctx.closePath()
      ctx.fillStyle = color
      ctx.fill()
    }

    let startAngle = -Math.PI / 2

    // Elderly Care
    const elderlyAngle = (distribution.elderlyCare / total) * Math.PI * 2
    drawSegment(startAngle, startAngle + elderlyAngle, "#1a2352")
    startAngle += elderlyAngle

    // Children Care
    const childrenAngle = (distribution.childrenCare / total) * Math.PI * 2
    drawSegment(startAngle, startAngle + childrenAngle, "#00C2CB")
    startAngle += childrenAngle

    // Disability Care
    const disabilityAngle = (distribution.disabilityCare / total) * Math.PI * 2
    drawSegment(startAngle, startAngle + disabilityAngle, "#FF8A65")

    // Draw center circle (white)
    ctx.beginPath()
    ctx.arc(centerX, centerY, innerRadius * 0.9, 0, Math.PI * 2)
    ctx.fillStyle = "white"
    ctx.fill()

    // Draw percentage in center
    ctx.fillStyle = "#1a2352"
    ctx.font = "bold 24px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(`${Math.round(distribution.elderlyCare)}%`, centerX, centerY)
  }, [distribution, canvasRef])

  return (
    <div className="flex justify-center items-center h-full">
      <div className="relative">
        <canvas ref={canvasRef} width="200" height="200"></canvas>

      </div>
    </div>
  )
}

