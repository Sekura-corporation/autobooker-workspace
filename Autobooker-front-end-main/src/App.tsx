import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthProvider";
import { CartProvider } from "@/context/CartContext";
import AppRoutes from "@/routes";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
