const API_BASE_URL = "https://camrent-backend.up.railway.app/api";

export interface CreateContractFromVerificationResult {
  contractId: string;
}

export const contractService = {
  /**
   * Tạo hợp đồng từ verificationId
   */
  async createFromVerification(
    verificationId: string,
    token?: string | null
  ): Promise<CreateContractFromVerificationResult> {
    const accessToken = token ?? localStorage.getItem("accessToken");

    if (!accessToken) {
      throw new Error("Vui lòng đăng nhập để tạo hợp đồng.");
    }

    const response = await fetch(
      `${API_BASE_URL}/Contracts/verification/${verificationId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Tạo hợp đồng thất bại");
    }

    const data = await response.json();
    const contractId =
      data?.contractId || data?.id || data?.data?.id || data?.data?.contractId;

    if (!contractId) {
      throw new Error("Không xác định được mã hợp đồng");
    }

    return { contractId };
  },

  /**
   * Lấy blob PDF xem trước hợp đồng
   */
  async getPreview(contractId: string, token?: string | null): Promise<Blob> {
    const accessToken = token ?? localStorage.getItem("accessToken");

    if (!accessToken) {
      throw new Error("Vui lòng đăng nhập để xem hợp đồng.");
    }

    const response = await fetch(
      `${API_BASE_URL}/Contracts/${contractId}/preview`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Không thể lấy file xem trước hợp đồng");
    }

    return await response.blob();
  },

  /**
   * Ký hợp đồng với chữ ký base64
   */
  async sign(
    contractId: string,
    signatureBase64: string,
    token?: string | null
  ): Promise<void> {
    const accessToken = token ?? localStorage.getItem("accessToken");

    if (!accessToken) {
      throw new Error("Vui lòng đăng nhập để ký hợp đồng.");
    }

    const response = await fetch(
      `${API_BASE_URL}/Contracts/${contractId}/sign`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          signatureBase64,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Ký hợp đồng thất bại");
    }
  },
};
