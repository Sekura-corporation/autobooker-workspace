import { useContext } from "react";
import CartContext from "./CartContext";
import type { CartContextType } from "./CartContext";

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de CartProvider");
  }
  return context;
};
