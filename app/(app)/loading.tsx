export default function AppLoading() {
  return (
    <div className="flex flex-col gap-7" aria-busy="true" aria-label="Wird geladen">
      <div className="border-b border-line pb-5">
        <div className="h-3 w-24 animate-pulse rounded bg-surface-2" />
        <div className="mt-3 h-7 w-56 animate-pulse rounded bg-surface-2" />
        <div className="mt-2 h-3 w-80 max-w-full animate-pulse rounded bg-surface-2" />
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="h-28 animate-pulse rounded-[12px] border border-line bg-surface" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_318px]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="h-40 animate-pulse rounded-[14px] border border-line bg-surface" />
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <div className="h-60 animate-pulse rounded-[14px] border border-line bg-surface" />
          <div className="h-48 animate-pulse rounded-[14px] border border-line bg-surface" />
        </div>
      </div>
    </div>
  );
}
