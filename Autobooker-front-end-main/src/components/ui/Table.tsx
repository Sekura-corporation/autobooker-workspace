import type { TableHTMLAttributes } from "react";

interface TableCellProps extends TableHTMLAttributes<HTMLTableCellElement> {
  header?: boolean;
  align?: "left" | "center" | "right";
}

export function Table({
  className = "",
  ...props
}: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={`w-full border-collapse text-sm ${className}`}
      {...props}
    />
  );
}

export function TableHead({
  className = "",
  ...props
}: TableHTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={`bg-zinc-50 border-b-2 border-zinc-200 ${className}`}
      {...props}
    />
  );
}

export function TableBody({
  className = "",
  ...props
}: TableHTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={className} {...props} />;
}

export function TableRow({
  className = "",
  ...props
}: TableHTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={`border-b border-zinc-100 hover:bg-gray-50 transition-colors ${className}`}
      {...props}
    />
  );
}

export function TableCell({
  header = false,
  align = "left",
  className = "",
  children,
  ...props
}: TableCellProps) {
  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[align];

  const Element = header ? "th" : "td";

  return (
    <Element
      className={`px-4 py-3 ${alignClass} ${header ? "font-bold text-zinc-900 bg-zinc-50" : "text-zinc-700"} ${className}`}
      {...(props as TableHTMLAttributes<HTMLTableCellElement>)}
    >
      {children}
    </Element>
  );
}
