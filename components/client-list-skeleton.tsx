// components/client-list-skeleton.tsx
export default function ClientListSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="space-y-4">
          {/* Table header skeleton */}
          <div className="grid grid-cols-4 gap-4 pb-2 border-b">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Table rows skeleton */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-4 py-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-8 ml-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
