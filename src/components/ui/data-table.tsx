import type {
  HTMLAttributes,
  TableHTMLAttributes,
  ThHTMLAttributes,
  TdHTMLAttributes,
  Children,
} from "react";

export function DataTableContainer({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`overflow-x-auto ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function DataTable({
  className = "",
  children,
  ...props
}: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table className={`w-full text-left text-sm ${className}`.trim()} {...props}>
      {children}
    </table>
  );
}

export function DataTableHeader({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={`border-b border-[rgb(var(--border))] ${className}`.trim()} {...props}>{Children.toArray(children).filter((child) => typeof child !== "string" || child.trim().length > 0)}</thead>;
}

export function DataTableBody({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={`divide-y divide-[rgb(var(--border))] ${className}`.trim()} {...props}>
      {children}
    </tbody>
  );
}

export function DataTableRow({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={`align-middle ${className}`.trim()} {...props}>{children}</tr>;
}

export function DataTableHead({
  className = "",
  children,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={`whitespace-nowrap px-4 py-3 text-left align-middle text-[11px] font-semibold uppercase tracking-[0.08em] ${className}`.trim()} {...props}>{children}</th>;
}

export function DataTableCell({
  className = "",
  children,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`px-4 py-4 align-middle ${className}`.trim()} {...props}>{children}</td>;
}
