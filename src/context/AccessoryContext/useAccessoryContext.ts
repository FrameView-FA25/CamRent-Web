import { useContext } from "react";
import { AccessoryContext } from "./AccessoryContext.type";

export const useAccessoryContext = () => {
  const context = useContext(AccessoryContext);
  if (!context) {
    throw new Error(
      "useAccessoryContext phải được sử dụng trong AccessoryProvider"
    );
  }
  return context;
};
