import type {
  Camera,
  CreateCameraRequest,
  CreateCameraResponse,
} from "../types/camera.types";

const API_BASE_URL = "https://camrent-backend.up.railway.app/api";

export const cameraService = {
  /**
   * Get all cameras owned by the current owner
   */
  async getCamerasByOwnerId(): Promise<Camera[]> {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      `${API_BASE_URL}/Cameras/GetCamerasByOwnerId`,
      {
        method: "GET",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Failed to fetch cameras with status ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  },

  /**
   * Create a new camera
   */
  async createCamera(
    cameraData: CreateCameraRequest
  ): Promise<CreateCameraResponse> {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/Cameras`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cameraData),
    });

    if (!response.ok) {
      // Try to parse error response
      let errorMessage = `Failed to create camera with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.title || errorMessage;
      } catch {
        // If response is not JSON, use the default error message
      }
      throw new Error(errorMessage);
    }

    // Check if response has content
    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");

    // If no content or empty response (204 No Content)
    if (response.status === 204 || contentLength === "0") {
      // Return a success response with the data we sent
      return {
        id: "", // Backend will set this
        ...cameraData,
      };
    }

    // If response has JSON content
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return data;
    }

    // Fallback: try to parse as JSON
    try {
      const text = await response.text();
      if (text) {
        return JSON.parse(text);
      }
      // If empty text, return the data we sent
      return {
        id: "",
        ...cameraData,
      };
    } catch {
      // If all else fails, return the data we sent
      return {
        id: "",
        ...cameraData,
      };
    }
  },
};
