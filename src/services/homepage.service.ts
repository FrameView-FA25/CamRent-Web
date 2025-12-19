const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://camrent-backend.up.railway.app";

export interface CarouselSlide {
  id: string;
  title: string;
  content: string;
  linkUrl: string;
  sortOrder: number;
  isActive: boolean;
  imageUrl?: string;
}

export interface HomeBlock {
  key: string;
  title: string;
  content: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Feedback {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  isActive: boolean;
}

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    Authorization: `Bearer ${token}`,
  };
};

// Helper to handle fetch errors
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP Error: ${response.status}`);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
};

// ============== CAROUSEL APIs ==============

export const getCarouselSlides = async (): Promise<CarouselSlide[]> => {
  const response = await fetch(`${API_BASE_URL}/HomePage/carousel`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  });

  return handleResponse(response);
};

export const createCarouselSlide = async (
  formData: FormData
): Promise<CarouselSlide> => {
  const response = await fetch(`${API_BASE_URL}/HomePage/carousel`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
    },
    body: formData,
  });

  return handleResponse(response);
};

export const updateCarouselSlide = async (
  id: string,
  formData: FormData
): Promise<CarouselSlide> => {
  const response = await fetch(
    `${API_BASE_URL}/HomePage/carousel/${id}`,
    {
      method: "PUT",
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    }
  );

  return handleResponse(response);
};

export const deleteCarouselSlide = async (id: string): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/HomePage/carousel/${id}`,
    {
      method: "DELETE",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP Error: ${response.status}`);
  }
};

export const reorderCarousel = async (
  slideIds: string[]
): Promise<CarouselSlide[]> => {
  const response = await fetch(
    `${API_BASE_URL}/HomePage/carousel/reorder`,
    {
      method: "PUT",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(slideIds),
    }
  );

  return handleResponse(response);
};

// ============== BLOCKS APIs ==============

export const getHomeBlocks = async (): Promise<HomeBlock[]> => {
  const response = await fetch(`${API_BASE_URL}/HomePage/blocks`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  });

  return handleResponse(response);
};

export const getBlockByKey = async (key: string): Promise<HomeBlock> => {
  const response = await fetch(`${API_BASE_URL}/HomePage/blocks/${key}`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  });

  return handleResponse(response);
};

export const updateBlock = async (
  key: string,
  formData: FormData
): Promise<HomeBlock> => {
  const response = await fetch(`${API_BASE_URL}/HomePage/blocks/${key}`, {
    method: "PUT",
    headers: {
      ...getAuthHeaders(),
    },
    body: formData,
  });

  return handleResponse(response);
};

export const deleteBlock = async (key: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/HomePage/blocks/${key}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP Error: ${response.status}`);
  }
};

// ============== FEEDBACK APIs ==============

export const getFeedbacks = async (): Promise<Feedback[]> => {
  const response = await fetch(`${API_BASE_URL}/HomePage/feedback`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  });

  return handleResponse(response);
};