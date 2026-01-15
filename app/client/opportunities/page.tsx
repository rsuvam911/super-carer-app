"use client";

import { OpportunityPage } from "@/components/opportunity-page";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default function ClientOpportunitiesPage() {
  const { userRole } = useAuth();

  // Ensure this page is only accessible to clients
  if (userRole !== "client") {
    return <div>Access denied. Clients only.</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Your Opportunities</h1>
        <Link href="/client/opportunities/create">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Create Opportunity
          </Button>
        </Link>
      </div>
      <OpportunityPage userType="Client" />
    </div>
  );
}
