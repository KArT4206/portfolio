export default function Loading() {
  return (
    <div className="px-6 pb-[100px] pt-[58px] md:px-10">
      <div className="animate-pulse">
        <div className="h-4 w-28 border border-border-dim" />
        <div className="mt-3 h-10 w-72 border border-border-dim" />
        <div className="mt-4 h-4 w-96 max-w-full border border-border-dim" />

        <div className="mt-[50px] grid gap-[1px] bg-border-dim sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 bg-black" />
          ))}
        </div>
      </div>
    </div>
  );
}
