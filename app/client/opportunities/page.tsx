"use client";

import { OpportunityPage } from "@/components/opportunity-page";
import { useAuth } from "@/lib/auth-context";

export default function ClientOpportunitiesPage() {
  const { userRole } = useAuth();

  // Ensure this page is only accessible to clients
  if (userRole !== "client") {
    return <div>Access denied. Clients only.</div>;
  }

  return <OpportunityPage userType="Client" />;
}
