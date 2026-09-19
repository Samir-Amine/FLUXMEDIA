export default function Loading() {
  return (
    <div className="container-x pt-36" aria-busy="true" aria-label="Loading">
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <div className="mx-auto h-7 w-52 animate-pulse rounded-full bg-surface2" />
        <div className="mx-auto h-12 w-full animate-pulse rounded-2xl bg-surface2" />
        <div className="mx-auto h-12 w-4/5 animate-pulse rounded-2xl bg-surface2" />
        <div className="mx-auto h-5 w-3/5 animate-pulse rounded-full bg-surface2/70" />
      </div>
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-64 animate-pulse rounded-2xl bg-surface2/60" />
        ))}
      </div>
    </div>
  );
}
