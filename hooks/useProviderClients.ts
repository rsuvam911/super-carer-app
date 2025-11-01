// hooks/useProviderClients.ts
"use client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { ProviderClientService } from "@/services/providerClientService";
import { BaseApiResponse, ProviderClient } from "@/types/api";

// Hook for getting provider clients list
export function useProviderClients(
  pageNumber: number = 1,
  pageSize: number = 10,
  filters: Record<string, any> = {}
): UseQueryResult<BaseApiResponse<ProviderClient[]>, Error> {
  return useQuery({
    queryKey: ["providerClients", pageNumber, pageSize, filters],
    queryFn: () =>
      ProviderClientService.getProviderClients(pageNumber, pageSize, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Hook for getting specific client details
export function useClientDetails(
  clientId: string,
  enabled: boolean = true
): UseQueryResult<BaseApiResponse<ProviderClient>, Error> {
  return useQuery({
    queryKey: ["clientDetails", clientId],
    queryFn: () => ProviderClientService.getClientDetails(clientId),
    enabled: enabled && !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Hook for searching clients
export function useSearchClients(
  searchTerm: string,
  pageNumber: number = 1,
  pageSize: number = 10,
  enabled: boolean = true
): UseQueryResult<BaseApiResponse<ProviderClient[]>, Error> {
  return useQuery({
    queryKey: ["searchClients", searchTerm, pageNumber, pageSize],
    queryFn: () =>
      ProviderClientService.searchClients(searchTerm, pageNumber, pageSize),
    enabled: enabled && searchTerm.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    retry: 1,
  });
}
