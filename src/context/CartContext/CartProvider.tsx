import React, { useState, useCallback, useEffect } from "react";
import { CartContext } from "./CartContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setCartCount(0);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/Bookings/GetCard`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCartCount(data.items?.length || 0);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};
