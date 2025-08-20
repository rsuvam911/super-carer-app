import type React from "react"
import { ArrowDown, ArrowUp } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  change: number
  icon: React.ReactNode
}

export default function StatsCard({ title, value, change, icon }: StatsCardProps) {
  const isPositive = change >= 0

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-3xl font-semibold mt-2">{value}</h3>
          <div className="flex items-center mt-2">
            <span className={`text-xs ${isPositive ? "text-green-500" : "text-red-500"} flex items-center`}>
              {isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
              {Math.abs(change)}% Since last {title === "Total Earning" ? "week" : "month"}
            </span>
          </div>
        </div>
        <div className="bg-gray-100 p-3 rounded-full">{icon}</div>
      </div>
    </div>
  )
}

