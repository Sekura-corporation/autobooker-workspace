import { Routes, Route, Navigate } from "react-router-dom";

// Landing
import Landing from "@/pages/Landing";

// Auth
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import RecoverEmail from "@/pages/auth/RecoverEmail";
import RecoverCode from "@/pages/auth/RecoverCode";
import SuccessState from "@/pages/auth/SuccessState";

// M�dulos
import AdminRoutes from "./AdminRoutes";
import StoreRoutes from "./StoreRoutes";
import ClientRoutes from "./ClientRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      {/* -- Landing Page -- */}
      <Route path="/" element={<Landing />} />

      {/* -- Auth -- */}
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Register />} />
      <Route path="/recuperar-email" element={<RecoverEmail />} />
      <Route path="/recuperar-codigo" element={<RecoverCode />} />
      <Route
        path="/sucesso/cadastro"
        element={<SuccessState type="register" />}
      />
      <Route path="/sucesso/senha" element={<SuccessState type="password" />} />

      {/* -- Áreas Protegidas (Módulos de Rotas) -- */}
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/loja/*" element={<StoreRoutes />} />
      <Route path="/cliente/*" element={<ClientRoutes />} />

      {/* -- Fallback -- */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
