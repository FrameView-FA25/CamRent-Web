import { createContext } from "react";

export interface CartContextType {
  cartCount: number;
  refreshCart: () => Promise<void>;
}

export const CartContext = createContext<CartContextType | undefined>(
  undefined
);
