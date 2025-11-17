import { createContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Verification } from "../../types/verification.types";

/**
 * Interface định nghĩa kiểu dữ liệu của VerificationContext
 */
export interface VerificationContextType {
  verifications: Verification[];
  loading: boolean;
  error: string | null;
  fetchVerifications: () => Promise<void>;
  refreshVerifications: () => Promise<void>;
  setVerifications: Dispatch<SetStateAction<Verification[]>>;
}

/**
 * Tạo Context
 */
export const VerificationContext = createContext<
  VerificationContextType | undefined
>(undefined);
