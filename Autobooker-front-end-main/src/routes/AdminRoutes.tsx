import { Routes, Route, Navigate } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";

import AdminDashboard from "@/pages/admin/Dashboard";
import AdminStores from "@/pages/admin/Stores";
import AdminStoreDetail from "@/pages/admin/StoreDetail";
import AdminUsers from "@/pages/admin/Users";
import AdminPartnerships from "@/pages/admin/Partnerships";
import AdminPlans from "@/pages/admin/Plans";
import AdminSettings from "@/pages/admin/Settings";
import AdminProfile from "@/pages/admin/Profile";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="/admin/dashboard" replace />} />
      <Route
        path="dashboard"
        element={
          <PrivateRoute role="admin">
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="lojas"
        element={
          <PrivateRoute role="admin">
            <AdminStores />
          </PrivateRoute>
        }
      />
      <Route
        path="lojas/:id"
        element={
          <PrivateRoute role="admin">
            <AdminStoreDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="usuarios"
        element={
          <PrivateRoute role="admin">
            <AdminUsers />
          </PrivateRoute>
        }
      />
      <Route
        path="parcerias"
        element={
          <PrivateRoute role="admin">
            <AdminPartnerships />
          </PrivateRoute>
        }
      />
      <Route
        path="planos"
        element={
          <PrivateRoute role="admin">
            <AdminPlans />
          </PrivateRoute>
        }
      />
      <Route
        path="configuracoes"
        element={
          <PrivateRoute role="admin">
            <AdminSettings />
          </PrivateRoute>
        }
      />
      <Route
        path="perfil"
        element={
          <PrivateRoute role="admin">
            <AdminProfile />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
