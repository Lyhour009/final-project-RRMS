import { Skeleton } from "@/components/ui/skeleton";

// Shown by every dashboard route's `loading.tsx` while the server fetches
// data for the page. Without this, Next.js has no static shell to prefetch
// or stream behind, so navigating between dashboard pages shows nothing
// until the full server response comes back.
export function PageSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>

      <Skeleton className="h-72 rounded-2xl" />
    </div>
  );
}
