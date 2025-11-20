import { createContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Accessory } from "../../types/accessory.types";

export interface AccessoryContextType {
  accessories: Accessory[];
  loading: boolean;
  error: string | null;
  fetchAccessories: () => Promise<void>;
  refreshAccessories: () => Promise<void>;
  deleteAccessory: (id: string) => Promise<void>;
  setAccessories: Dispatch<SetStateAction<Accessory[]>>;
}

export const AccessoryContext = createContext<AccessoryContextType | undefined>(
  undefined
);
