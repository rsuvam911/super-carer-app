// app/provider/opportunities/page.tsx
"use client";

import { OpportunityPage } from "@/components/opportunity-page";
import { useAuth } from "@/lib/auth-context";

export default function ProviderOpportunitiesPage() {
  const { userRole } = useAuth();

  // Ensure this page is only accessible to care providers
  if (userRole !== "care-provider") {
    return <div>Access denied. Care providers only.</div>;
  }

  return <OpportunityPage userType="CareProvider" />;
}
