import React, { createContext, useState, type ReactNode } from "react";

export interface CartItem {
  id: string;
  storeId: string;
  storeName: string;
  type: "service" | "package" | "product";
  name: string;
  price: number;
  quantity: number;
  duration?: string;
}

export interface CartContextType {
  items: CartItem[];
  storeInfo: { id: string; name: string; address: string } | null;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [storeInfo, setStoreInfo] = useState<{
    id: string;
    name: string;
    address: string;
  } | null>(null);

  const addItem = (item: CartItem) => {
    // Se for produto, pode ter múltiplas unidades
    if (item.type === "product") {
      const existingItem = items.find((i) => i.id === item.id);
      if (existingItem) {
        setItems(
          items.map((i) =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i,
          ),
        );
      } else {
        setItems([...items, item]);
      }
    } else {
      // Serviços e pacotes não duplicam
      if (!items.find((i) => i.id === item.id)) {
        setItems([...items, item]);
      }
    }

    // Atualizar info da loja
    if (item.storeId) {
      setStoreInfo({
        id: item.storeId,
        name: item.storeName,
        address: item.storeName, // será atualizado depois
      });
    }
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
    } else {
      setItems(
        items.map((item) => (item.id === id ? { ...item, quantity } : item)),
      );
    }
  };

  const clearCart = () => {
    setItems([]);
    setStoreInfo(null);
  };

  const getTotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        storeInfo,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
