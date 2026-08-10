export default function Loading() {
  return (
    <div className="px-6 pb-24 pt-16 sm:pt-20">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-4 w-28 rounded bg-surface-2" />
        <div className="mt-3 h-10 w-72 rounded bg-surface-2" />
        <div className="mt-4 h-4 w-96 max-w-full rounded bg-surface-2" />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 rounded-2xl border border-border bg-surface" />
          ))}
        </div>
      </div>
    </div>
  );
}
