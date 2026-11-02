import { Skeleton } from './Feedback'

export function PageSkeleton({ bare = false }: { bare?: boolean }) {
  return (
    <div className={bare ? 'min-h-svh bg-ground p-6' : ''} aria-busy="true" aria-label="Loading the page">
      <div className="mx-auto max-w-[880px] space-y-4">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-[420px] max-w-full" />
        <div className="grid gap-3 pt-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[92px]" />
          ))}
        </div>
        <Skeleton className="h-[260px]" />
      </div>
    </div>
  )
}
