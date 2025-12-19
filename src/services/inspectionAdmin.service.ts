import type {
  ChecklistTemplateDetail,
  ChecklistTemplateSummary,
  InspectionMethod,
  InspectionType,
  ItemType,
  UpsertChecklistTemplateRequest,
  UpsertInspectionMethodRequest,
} from "@/types/inspection.types";

const API_BASE_URL = "https://camrent-backend.up.railway.app/api";

const requireToken = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");
  }
  return token;
};

const buildError = async (response: Response, fallback: string) => {
  let message = fallback;
  try {
    const data = await response.json();
    if (data?.message) {
      message = data.message;
    }
  } catch {
    const text = await response.text().catch(() => "");
    if (text) message = text;
  }
  return new Error(message);
};

const authFetch = async <T>(
  path: string,
  init: RequestInit = {},
  parseJson: boolean = true
): Promise<T> => {
  const token = requireToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw await buildError(
      response,
      `Yêu cầu thất bại (${response.status}) đối với ${path}`
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (!parseJson) {
    return (await response.text()) as T;
  }

  return (await response.json()) as T;
};

export const inspectionAdminService = {
  // Inspection methods
  listMethods(includeInactive: boolean = true): Promise<InspectionMethod[]> {
    const query = includeInactive ? "?includeInactive=true" : "";
    return authFetch<InspectionMethod[]>(
      `/inspection-methods${query}`,
      {
        method: "GET",
      }
    );
  },

  createMethod(
    payload: UpsertInspectionMethodRequest
  ): Promise<{ id: string }> {
    return authFetch<{ id: string }>(`/inspection-methods`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },

  updateMethod(
    id: string,
    payload: UpsertInspectionMethodRequest
  ): Promise<{ message: string }> {
    return authFetch<{ message: string }>(`/inspection-methods/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },

  deleteMethod(id: string): Promise<{ message: string }> {
    return authFetch<{ message: string }>(`/inspection-methods/${id}`, {
      method: "DELETE",
    });
  },

  // Checklist templates
  listTemplates(
    itemType?: ItemType,
    inspectionType?: InspectionType | null
  ): Promise<ChecklistTemplateSummary[]> {
    const params = new URLSearchParams();
    if (itemType) params.append("itemType", String(itemType));
    if (inspectionType) params.append("inspectionType", String(inspectionType));

    const query = params.toString();
    const path = query
      ? `/inspection-checklists?${query}`
      : `/inspection-checklists`;

    return authFetch<ChecklistTemplateSummary[]>(path, { method: "GET" });
  },

  getTemplate(id: string): Promise<ChecklistTemplateDetail> {
    return authFetch<ChecklistTemplateDetail>(
      `/inspection-checklists/${id}`,
      { method: "GET" }
    );
  },

  createTemplate(
    payload: UpsertChecklistTemplateRequest
  ): Promise<{ id: string }> {
    return authFetch<{ id: string }>(`/inspection-checklists`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },

  updateTemplate(
    id: string,
    payload: UpsertChecklistTemplateRequest
  ): Promise<{ message: string }> {
    return authFetch<{ message: string }>(`/inspection-checklists/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },

  setTemplateActive(
    id: string,
    isActive: boolean
  ): Promise<{ message: string }> {
    return authFetch<{ message: string }>(`/inspection-checklists/${id}/active`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isActive }),
    });
  },

  deleteTemplate(id: string): Promise<{ message: string }> {
    return authFetch<{ message: string }>(`/inspection-checklists/${id}`, {
      method: "DELETE",
    });
  },
};

