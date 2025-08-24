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
        const response: BaseApiResponse<ProviderListItem[]> =
          await ProviderService.getProviders(page, pageSize);

        // Append results instead of replacing
        setProviders((prev) => [...prev, ...response.payload]);

        setHasNextPage(response.meta?.hasNextPage ?? false);
      } catch (err) {
        console.error('Failed to fetch providers:', err);
        setError('Failed to load providers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [page]);

  const handleViewProfile = (userId: string) => {
    router.push(`/client/bookings/provider/${userId}`);
  };

  const handleBookNow = (userId: string) => {
    router.push(`/client/bookings/book/${userId}`);
  };

  const handleLoadMore = () => {
    if (hasNextPage) setPage((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Find Care Providers</h1>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((provider) => (
          <ProviderCard
            key={provider.userId}
            provider={provider}
            onViewProfile={handleViewProfile}
            onBookNow={handleBookNow}
          />
        ))}
      </div>

      {/* Load More Button */}
      <div className="flex justify-center mt-8">
        {hasNextPage && (
          <Button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-2"
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        )}
      </div>

      {/* Error Display */}
      {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
    </div>
  );
}
