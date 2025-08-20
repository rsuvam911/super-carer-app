"use client"

import { useState } from "react"
import { Star, ChevronDown, ChevronUp } from "lucide-react"
import RatingGauge from "@/components/rating-gauge"
import { useRatings } from "@/lib/api"

export default function RatingsPage() {
  const { data: rating } = useRatings()
  const [activeTab, setActiveTab] = useState("all")
  const [expandedReview, setExpandedReview] = useState<string | null>(null)

  // Mock reviews data
  const reviews = [
    {
      id: "1",
      name: "Emma Thompson",
      date: "15 Apr, 2025",
      rating: 5,
      comment:
        "Excellent service! The caregiver was professional, punctual, and very caring. My mother felt comfortable and well taken care of. Would definitely recommend to others looking for quality care services.",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "2",
      name: "Michael Johnson",
      date: "12 Apr, 2025",
      rating: 4,
      comment:
        "Very good experience overall. The caregiver was knowledgeable and attentive. Only minor issue was a slight delay in arrival time on the first day, but communication was good.",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "3",
      name: "Sarah Williams",
      date: "10 Apr, 2025",
      rating: 3,
      comment:
        "Decent service. The caregiver was friendly but seemed a bit inexperienced. Some tasks required additional explanation. Room for improvement but generally satisfied with the care provided.",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "4",
      name: "David Brown",
      date: "8 Apr, 2025",
      rating: 5,
      comment:
        "Outstanding care provided! The caregiver went above and beyond to ensure my father was comfortable and engaged. Very impressed with the level of professionalism and compassion shown.",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "5",
      name: "Jennifer Davis",
      date: "5 Apr, 2025",
      rating: 2,
      comment:
        "Disappointed with the service. The caregiver was often distracted and did not follow the care plan as discussed. Had to frequently remind them of important tasks. Would not use again.",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const filteredReviews =
    activeTab === "all"
      ? reviews
      : reviews.filter((review) => {
          if (activeTab === "positive") return review.rating >= 4
          if (activeTab === "neutral") return review.rating === 3
          if (activeTab === "negative") return review.rating <= 2
          return true
        })

  const toggleReview = (id: string) => {
    if (expandedReview === id) {
      setExpandedReview(null)
    } else {
      setExpandedReview(id)
    }
  }

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
      ))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Ratings & Reviews</h1>
        <p className="text-gray-500">Monitor your performance and client feedback</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium mb-4">Overall Rating</h2>
          <RatingGauge />

          <div className="mt-6 space-y-3">
            <div className="flex items-center">
              <div className="flex mr-2">{renderStars(5)}</div>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="bg-[#00C2CB] h-full" style={{ width: "65%" }}></div>
              </div>
              <span className="ml-2 text-sm text-gray-500">65%</span>
            </div>

            <div className="flex items-center">
              <div className="flex mr-2">{renderStars(4)}</div>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="bg-[#00C2CB] h-full" style={{ width: "20%" }}></div>
              </div>
              <span className="ml-2 text-sm text-gray-500">20%</span>
            </div>

            <div className="flex items-center">
              <div className="flex mr-2">{renderStars(3)}</div>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="bg-[#00C2CB] h-full" style={{ width: "10%" }}></div>
              </div>
              <span className="ml-2 text-sm text-gray-500">10%</span>
            </div>

            <div className="flex items-center">
              <div className="flex mr-2">{renderStars(2)}</div>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="bg-[#00C2CB] h-full" style={{ width: "3%" }}></div>
              </div>
              <span className="ml-2 text-sm text-gray-500">3%</span>
            </div>

            <div className="flex items-center">
              <div className="flex mr-2">{renderStars(1)}</div>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="bg-[#00C2CB] h-full" style={{ width: "2%" }}></div>
              </div>
              <span className="ml-2 text-sm text-gray-500">2%</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-2 rounded-md text-sm ${activeTab === "all" ? "bg-[#00C2CB] text-white" : "bg-gray-100 text-gray-500"}`}
                >
                  All Reviews
                </button>
                <button
                  onClick={() => setActiveTab("positive")}
                  className={`px-4 py-2 rounded-md text-sm ${activeTab === "positive" ? "bg-[#00C2CB] text-white" : "bg-gray-100 text-gray-500"}`}
                >
                  Positive
                </button>
                <button
                  onClick={() => setActiveTab("neutral")}
                  className={`px-4 py-2 rounded-md text-sm ${activeTab === "neutral" ? "bg-[#00C2CB] text-white" : "bg-gray-100 text-gray-500"}`}
                >
                  Neutral
                </button>
                <button
                  onClick={() => setActiveTab("negative")}
                  className={`px-4 py-2 rounded-md text-sm ${activeTab === "negative" ? "bg-[#00C2CB] text-white" : "bg-gray-100 text-gray-500"}`}
                >
                  Negative
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredReviews.map((review) => (
                <div key={review.id} className="p-4">
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                      <img
                        src={review.avatar || "/placeholder.svg"}
                        alt={review.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{review.name}</h3>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>

                      <div className="flex my-1">{renderStars(review.rating)}</div>

                      <p className={`text-sm text-gray-600 ${expandedReview === review.id ? "" : "line-clamp-2"}`}>
                        {review.comment}
                      </p>

                      {review.comment.length > 120 && (
                        <button
                          onClick={() => toggleReview(review.id)}
                          className="text-[#00C2CB] text-sm flex items-center mt-1"
                        >
                          {expandedReview === review.id ? (
                            <>
                              Show less <ChevronUp className="h-4 w-4 ml-1" />
                            </>
                          ) : (
                            <>
                              Read more <ChevronDown className="h-4 w-4 ml-1" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

