import { useContext } from "react";
import { VerificationContext } from "./VerificationContext";

/**
 * Custom hook để sử dụng VerificationContext
 * Wrapper giúp code gọn hơn và tự động check context
 *
 * @throws Error nếu hook được gọi ngoài VerificationProvider
 * @returns VerificationContext value
 */
export const useVerificationContext = () => {
  const context = useContext(VerificationContext);

  if (!context) {
    throw new Error(
      "useVerificationContext must be used within VerificationProvider"
    );
  }

  return context;
};
