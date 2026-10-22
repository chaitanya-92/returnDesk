import type { HTMLAttributes, TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from "react";

type ClassNameProps = { className?: string };

export function DataTableContainer({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`overflow-x-auto ${className}`.trim()} {...props}>{children}</div>;
}

export function DataTable({ className = "", children, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return <table className={`w-full text-left text-sm ${className}`.trim()} {...props}>{children}</table>;
}

export function DataTableHeader({ className = "", children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={className} {...props}>{children}</thead>;
}

export function DataTableBody({ className = "", children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={`divide-y divide-[rgb(var(--border))] ${className}`.trim()} {...props}>{children}</tbody>;
}

export function DataTableRow({ className = "", children, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={className} {...props}>{children}</tr>;
}

export function DataTableHead({ className = "", children, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={`px-3 py-2.5 ${className}`.trim()} {...props}>{children}</th>;
}

export function DataTableCell({ className = "", children, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`px-4 py-4 ${className}`.trim()} {...props}>{children}</td>;
}
