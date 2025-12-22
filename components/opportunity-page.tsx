"use client";

import { useState, useEffect } from "react";
import { OpportunityService } from "@/services/opportunityService";
import {
  ClientOpportunity,
  ProviderOpportunity,
  Opportunity,
} from "@/types/opportunity";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface OpportunityPageProps {
  userType: "Client" | "CareProvider";
}

export function OpportunityPage({ userType }: OpportunityPageProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    fetchOpportunities();
  }, [userType, page]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const response = await OpportunityService.getOpportunities(
        userType,
        page,
        10
      );

      if (response.success) {
        setOpportunities(response.payload);
        setHasNextPage(response.meta.hasNextPage);
        setHasPreviousPage(response.meta.hasPreviousPage);
      } else {
        setError("Failed to fetch opportunities");
      }
    } catch (err) {
      setError("An error occurred while fetching opportunities");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (hasPreviousPage && page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Opportunities</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card
              key={index}
              className="overflow-hidden bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <CardHeader className="pb-4">
                <Skeleton className="h-6 w-3/4 bg-gray-200 rounded" />
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <Skeleton className="h-4 w-full bg-gray-200 rounded" />
                <Skeleton className="h-4 w-2/3 bg-gray-200 rounded" />
                <Skeleton className="h-4 w-1/2 bg-gray-200 rounded" />
                <div className="flex justify-between pt-4 space-x-2">
                  <Skeleton className="h-10 w-24 bg-gray-200 rounded" />
                  <Skeleton className="h-10 w-24 bg-gray-200 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            Error Loading Opportunities
          </h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Button
            onClick={fetchOpportunities}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          {userType === "Client"
            ? "Available Opportunities"
            : "Assignable Opportunities"}
        </h1>
      </div>

      {opportunities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              No Opportunities Found
            </h2>
            <p className="text-gray-500 max-w-md">
              {userType === "Client"
                ? "There are currently no available opportunities."
                : "There are currently no assignable opportunities."}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                userType={userType}
              />
            ))}
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <Button
              onClick={handlePreviousPage}
              disabled={!hasPreviousPage}
              variant="outline"
              className="flex items-center space-x-2 px-6 py-2 rounded-md border-gray-300 hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>Previous</span>
            </Button>

            <span className="text-sm text-gray-500 font-medium">
              Page {page}
            </span>

            <Button
              onClick={handleNextPage}
              disabled={!hasNextPage}
              variant="outline"
              className="flex items-center space-x-2 px-6 py-2 rounded-md border-gray-300 hover:bg-gray-50"
            >
              <span>Next</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  userType: "Client" | "CareProvider";
}

function OpportunityCard({ opportunity, userType }: OpportunityCardProps) {
  const isClientOpportunity = "clientName" in opportunity;

  const getUrgencyBadgeColor = (urgency: string) => {
    switch (urgency) {
      case "As soon as possible":
        return "bg-red-100 text-red-800 border-red-200";
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className="overflow-hidden bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-gray-900 pr-2">
            {opportunity.title}
          </CardTitle>
          <Badge
            variant="secondary"
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium",
              getUrgencyBadgeColor(opportunity.urgency)
            )}
          >
            {opportunity.serviceType}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600 text-sm leading-relaxed">
          {opportunity.description}
        </p>

        <div className="space-y-3 text-sm">
          <div className="flex items-center text-gray-700">
            <svg
              className="w-4 h-4 mr-2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="font-medium mr-2">Location:</span>
            <span>
              {opportunity.location.city}, {opportunity.location.state}
            </span>
          </div>

          <div className="flex items-center text-gray-700">
            <svg
              className="w-4 h-4 mr-2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="font-medium mr-2">Date:</span>
            <span>{new Date(opportunity.date).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center text-gray-700">
            <svg
              className="w-4 h-4 mr-2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium mr-2">Urgency:</span>
            <Badge
              variant="outline"
              className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                getUrgencyBadgeColor(opportunity.urgency)
              )}
            >
              {opportunity.urgency}
            </Badge>
          </div>

          {isClientOpportunity && (
            <div className="flex items-center text-gray-700">
              <svg
                className="w-4 h-4 mr-2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="font-medium mr-2">Client:</span>
              <span>{opportunity.clientName}</span>
            </div>
          )}

          {isClientOpportunity && (
            <div className="flex items-center text-gray-700">
              <svg
                className="w-4 h-4 mr-2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium mr-2">Expected Hours:</span>
              <span>{opportunity.expectedHours}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4 space-x-2">
          <Button
            variant="outline"
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            View Details
          </Button>

          {userType === "Client" ? (
            <Button className="flex-1 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Contact Provider
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                View Details
              </Button>
              {isClientOpportunity && opportunity.hasApplied ? (
                <Button
                  disabled
                  className="flex-1 px-4 py-2 text-sm font-medium bg-gray-400 text-white rounded-md cursor-not-allowed"
                >
                  Applied
                </Button>
              ) : (
                <Button className="flex-1 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Apply
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
