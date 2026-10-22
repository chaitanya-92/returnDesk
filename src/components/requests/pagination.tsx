type RequestPaginationProps = {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
};

const buttonClassName =
  "rounded-lg border border-[rgb(var(--border))] px-3 py-2 text-xs font-medium text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] disabled:cursor-not-allowed disabled:opacity-40";

/** Shared accessible pagination for server- and client-paginated tables. */
export function Pagination({
  page,
  pageCount,
  total,
  pageSize,
  itemLabel = "items",
  onPageChange,
}: RequestPaginationProps) {
  const firstItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 border-t border-[rgb(var(--border))] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-[rgb(var(--muted-foreground))]">
        Showing {firstItem}–{lastItem} of {total} {itemLabel}
      </p>
      <nav aria-label={`${itemLabel} table pagination`} className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className={buttonClassName}
        >
          Previous
        </button>
        <span aria-live="polite" className="px-2 text-xs text-[rgb(var(--muted-foreground))]">
          Page {page} of {Math.max(1, pageCount)}
        </span>
        <button
          type="button"
          disabled={page >= pageCount}
          onClick={() => onPageChange(Math.min(pageCount, page + 1))}
          className={buttonClassName}
        >
          Next
        </button>
      </nav>
    </div>
  );
}
