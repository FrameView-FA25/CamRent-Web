import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import { router } from "./routers/MainRouter";
import "./styles/global.css";
import "react-toastify/dist/ReactToastify.css";
import { CartProvider } from "./context/CartContext";
import { CompareProvider } from "./context/CompareContext/CompareContext";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CartProvider>
      <CompareProvider>
        <RouterProvider router={router} />
        <ToastContainer />
      </CompareProvider>
    </CartProvider>
  </StrictMode>
);
