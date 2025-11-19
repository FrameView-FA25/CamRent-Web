import { useContext } from "react";
import { CartContext } from "./CartContext";
import type { CartContextType } from "./CartContext";

export const useCartContext = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within CartProvider");
  }
  return context;
};
