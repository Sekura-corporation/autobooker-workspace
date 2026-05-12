import { Routes, Route, Navigate } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";

import StoreDashboard from "@/pages/store/Dashboard";
import StoreAgenda from "@/pages/store/Agenda";
import StoreAppointmentDetail from "@/pages/store/AppointmentDetail";
import StoreServices from "@/pages/store/Services";
import StorePackages from "@/pages/store/Packages";
import StoreStock from "@/pages/store/Stock";
import StoreCustomers from "@/pages/store/Customers";
import StoreCustomerProfile from "@/pages/store/CustomerProfile";
import StoreReports from "@/pages/store/Reports";
import StoreLoyalty from "@/pages/store/Loyalty";
import StoreProfile from "@/pages/store/StoreProfile";

export default function StoreRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="/loja/dashboard" replace />} />
      <Route
        path="dashboard"
        element={
          <PrivateRoute role="store">
            <StoreDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="agenda"
        element={
          <PrivateRoute role="store">
            <StoreAgenda />
          </PrivateRoute>
        }
      />
      <Route
        path="agenda/:id"
        element={
          <PrivateRoute role="store">
            <StoreAppointmentDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="servicos"
        element={
          <PrivateRoute role="store">
            <StoreServices />
          </PrivateRoute>
        }
      />
      <Route
        path="pacotes"
        element={
          <PrivateRoute role="store">
            <StorePackages />
          </PrivateRoute>
        }
      />
      <Route
        path="estoque"
        element={
          <PrivateRoute role="store">
            <StoreStock />
          </PrivateRoute>
        }
      />
      <Route
        path="clientes"
        element={
          <PrivateRoute role="store">
            <StoreCustomers />
          </PrivateRoute>
        }
      />
      <Route
        path="clientes/:id"
        element={
          <PrivateRoute role="store">
            <StoreCustomerProfile />
          </PrivateRoute>
        }
      />
      <Route
        path="relatorios"
        element={
          <PrivateRoute role="store">
            <StoreReports />
          </PrivateRoute>
        }
      />
      <Route
        path="fidelidade"
        element={
          <PrivateRoute role="store">
            <StoreLoyalty />
          </PrivateRoute>
        }
      />
      <Route
        path="perfil"
        element={
          <PrivateRoute role="store">
            <StoreProfile />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
