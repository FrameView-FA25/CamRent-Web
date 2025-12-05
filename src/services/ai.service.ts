/**
 * Service cho AI Search - Vector Search
 */

const API_BASE_URL = "https://camrent-backend.up.railway.app/api";

export interface AISearchRequest {
  query: string;
  topK: number;
}

export interface AISearchResult {
  id: string;
  class: "Camera" | "Accessory";
  name: string;
  description: string;
  score: number;
}

export const aiService = {
  /**
   * Gọi AI để tìm kiếm camera/accessory phù hợp
   * @param query - Mô tả yêu cầu của người dùng
   * @param topK - Số lượng kết quả mong muốn
   * @returns Promise chứa danh sách kết quả
   */
  async recommend(query: string, topK: number = 5): Promise<AISearchResult[]> {
   
    const response = await fetch(`${API_BASE_URL}/AI/recommend`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      
      },
      body: JSON.stringify({
        query,
        topK,
      }),
    });

    if (!response.ok) {
      let errorMessage = `AI search thất bại với mã lỗi ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        const errorText = await response.text().catch(() => "");
        if (errorText) errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  },
};
