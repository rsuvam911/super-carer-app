"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useProviderClients,
  useSearchClients,
} from "@/hooks/useProviderClients";
import { MoreVertical, Search, Loader2 } from "lucide-react";
import { useState } from "react";
import { ProviderClient } from "@/types/api";
import ClientListSkeleton from "@/components/client-list-skeleton";

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Use search hook when there's a search term, otherwise use regular clients hook
  const {
    data: clientsResponse,
    isLoading,
    error,
  } = useProviderClients(1, 50, { sortBy });

  const { data: searchResponse, isLoading: isSearching } = useSearchClients(
    searchTerm,
    1,
    50,
    searchTerm.length > 0
  );

  // Use search results if searching, otherwise use regular results
  const activeResponse =
    searchTerm.length > 0 ? searchResponse : clientsResponse;
  const clients = activeResponse?.payload || [];
  const meta = activeResponse?.meta;
  const isLoadingData = searchTerm.length > 0 ? isSearching : isLoading;

  // Format location for display
  const formatLocation = (client: ProviderClient) => {
    if (!client.location) return "N/A";
    const { city, state, streetAddress } = client.location;

    // Build location string from available parts
    const parts = [];
    if (streetAddress) parts.push(streetAddress);
    if (city) parts.push(city);
    if (state) parts.push(state);

    return parts.length > 0 ? parts.join(", ") : "N/A";
  };

  // Format profile picture URL
  const getProfilePictureUrl = (client: ProviderClient) => {
    if (!client.profilePicture) return "/placeholder.svg?height=32&width=32";

    // If it's already a full URL, return as is
    if (client.profilePicture.startsWith("http")) {
      return client.profilePicture;
    }

    // If it's a relative path, prepend the API base URL
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://careappapi.intellexio.com";
    return `${baseUrl}${client.profilePicture}`;
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading clients</p>
          <p className="text-gray-500 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Client Listing</h1>
        <p className="text-gray-500">
          {clients.length > 0 ? `${clients.length} clients` : "Loading..."}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search clients by name, email, or location"
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00C2CB] focus:border-transparent"
          />
        </div>

        <div className="flex items-center">
          <span className="mr-2 text-sm">Sort by:</span>
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00C2CB] focus:border-transparent"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name_asc">A-Z</option>
            <option value="name_desc">Z-A</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoadingData ? (
          <ClientListSkeleton />
        ) : clients.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-gray-500 mb-2">
                {searchTerm
                  ? "No clients found matching your search"
                  : "No clients found"}
              </p>
              {searchTerm && (
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm("")}
                  className="mt-2"
                >
                  Clear search
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client: ProviderClient) => (
                    <TableRow key={client.userId}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                            <img
                              src={getProfilePictureUrl(client)}
                              alt={client.clientName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "/placeholder.svg?height=32&width=32";
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-medium">{client.clientName}</p>
                            <p className="text-sm text-gray-500">
                              {client.emailId}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {client.mobileNo}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatLocation(client)}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
