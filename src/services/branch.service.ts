import type { Branch } from "../types/branch.types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
  const accessToken = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
};

/**
 * Lấy danh sách tất cả các chi nhánh
 */
export const fetchBranches = async (): Promise<{
  branches: Branch[];
  error: string | null;
}> => {
  try {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      throw new Error("No access token found. Please login again.");
    }

    console.log("Fetching branches from:", `${API_BASE_URL}/Branchs`);

    const response = await fetch(`${API_BASE_URL}/Branchs`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    console.log("Branch response status:", response.status);

    if (response.status === 401) {
      localStorage.removeItem("accessToken");
      throw new Error("Unauthorized. Please login again.");
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Branch fetch error:", errorText);
      throw new Error(`Failed to fetch branches: ${response.status}`);
    }

    const data = await response.json();
    console.log("Branches data:", data);
    const branchesArray = Array.isArray(data) ? data : [data];

    return { branches: branchesArray, error: null };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An error occurred";
    console.error("Error fetching branches:", err);
    return { branches: [], error: errorMessage };
  }
};
