export default function AppLoading() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-label="Wird geladen">
      <div className="h-44 animate-pulse rounded-[26px] bg-navy/90" />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="h-32 animate-pulse rounded-[18px] border border-line bg-white" />
        ))}
      </div>
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_350px]">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="h-48 animate-pulse rounded-[20px] border border-line bg-white" />
          ))}
        </div>
        <div className="flex flex-col gap-5">
          <div className="h-64 animate-pulse rounded-[18px] border border-line bg-white" />
          <div className="h-52 animate-pulse rounded-[18px] border border-line bg-white" />
        </div>
      </div>
    </div>
  );
}
