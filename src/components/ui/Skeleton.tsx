import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
    />
  );
}

// File Grid Skeleton
export function FileGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center rounded-lg p-3"
        >
          <Skeleton className="mb-2 h-12 w-12 rounded-lg" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="mt-1 h-2 w-10" />
        </div>
      ))}
    </div>
  );
}

// File List Skeleton
export function FileListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center border-b border-border bg-muted/50 px-3 py-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="ml-3 h-4 w-20" />
        <Skeleton className="ml-auto h-4 w-16" />
        <Skeleton className="ml-8 h-4 w-24" />
      </div>
      {/* Rows */}
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center border-b border-border px-3 py-3 last:border-0">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="ml-3 h-4 w-4 rounded" />
          <Skeleton className="ml-2 h-4 w-32" />
          <Skeleton className="ml-auto h-4 w-12" />
          <Skeleton className="ml-8 h-4 w-28" />
        </div>
      ))}
    </div>
  );
}

// Bucket List Skeleton
export function BucketListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2 p-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 flex-1" />
          </div>
          <div className="ml-6 mt-1 space-y-1">
            <div className="flex items-center gap-2 px-2 py-1">
              <Skeleton className="h-3 w-3 rounded-sm" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="flex items-center gap-2 px-2 py-1">
              <Skeleton className="h-3 w-3 rounded-sm" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
