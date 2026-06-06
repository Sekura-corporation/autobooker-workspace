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

  // usado somente para produtos da lojinha física
  stock?: number;
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
    console.log("ITEM ADICIONADO AO CARRINHO:", item);
  
    setItems((prev) => {
      if (item.type === "product") {
        const existingItem = prev.find((i) => i.id === item.id);
  
        if (existingItem) {
          return prev.map((i) => {
            if (i.id !== item.id) {
              return i;
            }
  
            const maxStock = i.stock ?? item.stock ?? 999;
            const newQuantity = Math.min(
              i.quantity + item.quantity,
              maxStock,
            );
  
            return {
              ...i,
              quantity: newQuantity,
              stock: maxStock,
            };
          });
        }
  
        const maxStock = item.stock ?? 999;
  
        return [
          ...prev,
          {
            ...item,
            quantity: Math.min(item.quantity, maxStock),
            stock: maxStock,
          },
        ];
      }
  
      const alreadyExists = prev.some((i) => i.id === item.id);
  
      if (alreadyExists) {
        return prev;
      }
  
      return [...prev, item];
    });
  
    if (item.storeId) {
      setStoreInfo({
        id: item.storeId,
        name: item.storeName,
        address: item.storeName,
      });
    }
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
  
    setItems(
      items.map((item) => {
        if (item.id !== id) {
          return item;
        }
  
        if (item.type !== "product") {
          return {
            ...item,
            quantity,
          };
        }
  
        const maxStock = item.stock ?? 999;
  
        return {
          ...item,
          quantity: Math.min(quantity, maxStock),
        };
      }),
    );
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
