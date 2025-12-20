import type { IssueReport, IssueReportDetail } from "@/types/issueReport.types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const issueReportService = {
  getIssueReports: async (
    status: string = "open",
    limit: number = 50
  ): Promise<IssueReport[]> => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(
      `${API_BASE_URL}/BookingIssueReports?status=${status}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Không thể tải danh sách báo cáo vấn đề");
    }

    return response.json();
  },

  getIssueReportDetail: async (id: string): Promise<IssueReportDetail> => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(
      `${API_BASE_URL}/BookingIssueReports/${id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Không thể tải chi tiết báo cáo");
    }

    return response.json();
  },

  updateIssueReportStatus: async (
    id: string,
    status: string
  ): Promise<void> => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(
      `${API_BASE_URL}/BookingIssueReports/${id}/status`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      throw new Error("Không thể cập nhật trạng thái báo cáo");
    }
  },
};