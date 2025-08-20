"use client"

import { useEffect, useRef } from "react"
import { useServiceData } from "@/lib/api"

export default function AreaChart() {
  const { data: serviceData } = useServiceData()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !serviceData) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const parentWidth = canvas.parentElement?.clientWidth || 800
    canvas.width = parentWidth
    canvas.height = 300

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw chart
    const padding = 40
    const chartWidth = canvas.width - padding * 2
    const chartHeight = canvas.height - padding * 2

    // Find max value for scaling
    const maxValue = Math.max(...serviceData.map((d) => d.value))

    // Draw axes
    ctx.beginPath()
    ctx.strokeStyle = "#e5e7eb"
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, canvas.height - padding)
    ctx.lineTo(canvas.width - padding, canvas.height - padding)
    ctx.stroke()

    // Draw x-axis labels
    ctx.fillStyle = "#6b7280"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "center"

    const xStep = chartWidth / (serviceData.length - 1)
    serviceData.forEach((d, i) => {
      const x = padding + i * xStep
      ctx.fillText(d.month, x, canvas.height - padding + 20)
    })

    // Draw y-axis labels
    ctx.textAlign = "right"
    for (let i = 0; i <= 4; i++) {
      const y = canvas.height - padding - (i * chartHeight) / 4
      const value = Math.round((i * maxValue) / 4)
      ctx.fillText(value.toString(), padding - 10, y + 5)
    }

    // Draw area
    ctx.beginPath()
    ctx.moveTo(padding, canvas.height - padding)

    serviceData.forEach((d, i) => {
      const x = padding + i * xStep
      const y = canvas.height - padding - (d.value / maxValue) * chartHeight
      ctx.lineTo(x, y)
    })

    ctx.lineTo(canvas.width - padding, canvas.height - padding)
    ctx.closePath()

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, "rgba(0, 194, 203, 0.5)")
    gradient.addColorStop(1, "rgba(0, 194, 203, 0.0)")

    ctx.fillStyle = gradient
    ctx.fill()

    // Draw line
    ctx.beginPath()
    serviceData.forEach((d, i) => {
      const x = padding + i * xStep
      const y = canvas.height - padding - (d.value / maxValue) * chartHeight

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.strokeStyle = "#00C2CB"
    ctx.lineWidth = 2
    ctx.stroke()
  }, [serviceData, canvasRef])

  return (
    <div className="w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
    </div>
  )
}

