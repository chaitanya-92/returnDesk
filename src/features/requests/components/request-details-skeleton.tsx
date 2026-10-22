export function RequestDetailsSkeleton() {
  return (
    <div role="status" aria-label="Loading request details" className="animate-pulse space-y-6">
      <div className="flex items-start justify-between border-b border-[rgb(var(--border))] pb-5">
        <div className="space-y-3">
          <div className="h-3 w-28 rounded bg-[#EAE7DE] dark:bg-[rgb(var(--muted))]" />
          <div className="h-8 w-64 max-w-[70vw] rounded-lg bg-[#EAE7DE] dark:bg-[rgb(var(--muted))]" />
          <div className="h-3 w-48 rounded bg-[#F0EEE8] dark:bg-[rgb(var(--muted))]" />
        </div>
        <div className="h-7 w-24 rounded-md bg-[#EAE7DE] dark:bg-[rgb(var(--muted))]" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
        <div className="space-y-6">
          {[0, 1].map((section) => (
            <div key={section} className="rounded-xl border border-[rgb(var(--border))] p-5">
              <div className="mb-5 h-4 w-40 rounded bg-[#EAE7DE] dark:bg-[rgb(var(--muted))]" />
              <div className="space-y-3">
                {Array.from({ length: section === 0 ? 5 : 3 }, (_, index) => (
                  <div
                    key={index}
                    className="h-3 rounded bg-[#F0EEE8] dark:bg-[rgb(var(--muted))]"
                    style={{ width: `${92 - index * 11}%` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-6">
          <div className="h-56 rounded-xl border border-[rgb(var(--border))] bg-[#F8F6F0] dark:bg-[rgb(var(--muted))]" />
          <div className="h-44 rounded-xl border border-[rgb(var(--border))] bg-[#F8F6F0] dark:bg-[rgb(var(--muted))]" />
        </div>
      </div>
    </div>
  );
}
