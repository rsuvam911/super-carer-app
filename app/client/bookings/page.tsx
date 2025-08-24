// app/client/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProviderService } from '@/services/providerService';
import { BaseApiResponse, ProviderListItem } from '@/types/api';
import ProviderCard from '@/components/provider-card';
import { Button } from '@/components/ui/button';

export default function BrowseProvidersPage() {
  const router = useRouter();
  const [providers, setProviders] = useState<ProviderListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const pageSize = 10;

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response: BaseApiResponse<ProviderListItem[]> = await ProviderService.getProviders(page, pageSize);
        setProviders(response.payload);
        setHasNextPage(response.meta?.hasNextPage ?? false);
        // Handle other meta data if needed
      } catch (err) {
        console.error('Failed to fetch providers:', err);
        setError('Failed to load providers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [page]); // Re-fetch when page changes

  const handleViewProfile = (userId: string) => {
    router.push(`/client/provider/${userId}`);
  };

  const handleBookNow = (providerId: string) => {
    router.push(`/client/book/${providerId}`);
  };

  const handleNextPage = () => {
    if (hasNextPage) setPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(prev => prev - 1);
  };

  if (loading) return <div>Loading providers...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Find Care Providers</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((provider) => (
          <ProviderCard
            key={provider.userId} // or providerId
            provider={provider}
            onViewProfile={handleViewProfile}
            onBookNow={handleBookNow}
          />
        ))}
      </div>
      {/* Simple Pagination Controls */}
      <div className="flex justify-between items-center mt-6">
        <Button onClick={handlePrevPage} disabled={page === 1}>
          Previous
        </Button>
        <span>Page {page}</span>
        <Button onClick={handleNextPage} disabled={!hasNextPage}>
          Next
        </Button>
      </div>
    </div>
  );
}