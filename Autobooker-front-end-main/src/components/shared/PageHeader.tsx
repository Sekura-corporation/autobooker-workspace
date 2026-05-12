import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode; // Área reservada para botões de filtro, relatório, etc.
}

export default function PageHeader({
  title,
  subtitle,
  children,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-[#050505] tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-zinc-500 font-medium mt-1">{subtitle}</p>
        )}
      </div>

      {children && (
        <div className="flex flex-wrap items-center gap-4">{children}</div>
      )}
    </header>
  );
}
