import { Routes, Route, Navigate } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";

import ClientDashboard from "@/pages/client/Dashboard";
import ClientVehicles from "@/pages/client/Vehicles";
import ClientNewAppointment from "@/pages/client/NewAppointment";
import ClientStoreDetail from "@/pages/client/StoreDetail";
import ClientCart from "@/pages/client/Cart";
import ClientCheckout from "@/pages/client/Checkout";
import ClientAppointments from "@/pages/client/Appointments";
import ClientHistory from "@/pages/client/History";
import ClientLoyalty from "@/pages/client/Loyalty";
import ClientProfile from "@/pages/client/Profile";
import ClientSettings from "@/pages/client/Settings";

export default function ClientRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="/cliente/dashboard" replace />} />
      <Route
        path="dashboard"
        element={
          <PrivateRoute role="client">
            <ClientDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="veiculos"
        element={
          <PrivateRoute role="client">
            <ClientVehicles />
          </PrivateRoute>
        }
      />
      <Route
        path="novo-agendamento"
        element={
          <PrivateRoute role="client">
            <ClientNewAppointment />
          </PrivateRoute>
        }
      />
      <Route
        path="estética/:storeId"
        element={
          <PrivateRoute role="client">
            <ClientStoreDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="agendamento/carrinho"
        element={
          <PrivateRoute role="client">
            <ClientCart />
          </PrivateRoute>
        }
      />
      <Route
        path="agendamento/checkout"
        element={
          <PrivateRoute role="client">
            <ClientCheckout />
          </PrivateRoute>
        }
      />
      <Route
        path="agendamentos"
        element={
          <PrivateRoute role="client">
            <ClientAppointments />
          </PrivateRoute>
        }
      />
      <Route
        path="historico"
        element={
          <PrivateRoute role="client">
            <ClientHistory />
          </PrivateRoute>
        }
      />
      <Route
        path="fidelidade"
        element={
          <PrivateRoute role="client">
            <ClientLoyalty />
          </PrivateRoute>
        }
      />
      <Route
        path="perfil"
        element={
          <PrivateRoute role="client">
            <ClientProfile />
          </PrivateRoute>
        }
      />
      <Route
        path="configuracoes"
        element={
          <PrivateRoute role="client">
            <ClientSettings />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
