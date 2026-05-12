import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface PageWrapperProps {
  children: React.ReactNode;
  role?: "admin" | "store" | "client";
  pageTitle?: string;
  pageSubtitle?: string;
}

export default function PageWrapper({
  children,
  role,
  pageTitle = "Dashboard",
  pageSubtitle = "Bem-vindo de volta!",
}: PageWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  // Se role não for passado, usa o role do usuário autenticado
  const effectiveRole =
    role || (user?.role as "admin" | "store" | "client") || "admin";

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "var(--neutral-base)" }}
    >
      <Sidebar
        role={effectiveRole}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col">
        <Topbar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          pageTitle={pageTitle}
          pageSubtitle={pageSubtitle}
        />

        <main className="flex-1 pt-18 overflow-y-auto">
          <div className="p-6 lg:p-8 w-full max-w-none">{children}</div>
        </main>
      </div>
    </div>
  );
}
