import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import PageWrapper from "@/components/layout/PageWrapper";
import { ROLE_ROUTES } from "@/utils/constants";

export function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-base">
      <div className="w-8 h-8 border-4 border-neutral-base border-t-brand-primary rounded-full animate-spin" />
    </div>
  );
}

interface PrivateRouteProps {
  children: React.ReactNode;
  role?: "admin" | "store" | "client";
}

const normalizeRole = (role?: string) => {
  if (role === "store_owner") return "store";
  return role;
};

export function PrivateRoute({ children, role }: PrivateRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const normalizedUserRole = normalizeRole(user.role) as
    | "admin"
    | "store"
    | "client";

  if (role && normalizedUserRole !== role) {
    return <Navigate to={ROLE_ROUTES[normalizedUserRole] ?? "/login"} replace />;
  }

  return role ? (
    <PageWrapper role={role}>
      {children}
    </PageWrapper>
  ) : (
    <>{children}</>
  );
}