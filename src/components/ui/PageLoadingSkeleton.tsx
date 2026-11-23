/** Lightweight shared skeleton for App Router `loading.tsx` files. */
export function PageLoadingSkeleton() {
  return (
    <div className="min-h-[70vh] bg-background pt-28 pb-16" aria-busy="true" aria-live="polite">
      <div className="container mx-auto space-y-8 px-6">
        <div className="mx-auto h-3 w-28 animate-pulse rounded-full bg-muted" />
        <div className="mx-auto h-10 w-full max-w-md animate-pulse rounded-lg bg-muted" />
        <div className="mx-auto h-4 w-full max-w-xl animate-pulse rounded-md bg-muted/70" />
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-border/60 bg-white"
            >
              <div className="aspect-[4/3] animate-pulse bg-muted" />
              <div className="space-y-3 p-6">
                <div className="h-5 w-3/4 animate-pulse rounded-md bg-muted" />
                <div className="h-4 w-full animate-pulse rounded-md bg-muted/70" />
                <div className="h-4 w-5/6 animate-pulse rounded-md bg-muted/60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
