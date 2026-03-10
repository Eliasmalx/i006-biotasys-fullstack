import { User } from "../types";
import { API_ENDPOINTS } from "../constants/routes";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

export const api = {
  /* -------------------------------------------------------
     AUTH
  ------------------------------------------------------- */

  /**
   * Register a new user.
   * Matches backend CreateUserDto: { firstName, lastName, email, password, laboratory? }
   */
  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    laboratory?: string;
  }): Promise<{ id: string; email: string; emailVerified: boolean }> {
    const response = await fetch(`${API_ENDPOINTS.BASE}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || result.error || "Error al crear la cuenta");
    }
    return result;
  },

  async login(data: any): Promise<{ user: User; accessToken: string; refreshToken: string }> {
  const response = await fetch(
    `${API_ENDPOINTS.BASE}${API_ENDPOINTS.AUTH.LOGIN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Login failed");
  }

  return result; 
},


  async logout(data: { refreshToken: string }): Promise<{ message: string }> {
  const response = await fetch(
    `${API_ENDPOINTS.BASE}${API_ENDPOINTS.AUTH.LOGOUT}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Error al cerrar sesión");
  }

  return result;
},


  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.BASE}${API_ENDPOINTS.HEALTH}`
      );
      return response.ok;
    } catch {
      return false;
    }
  },

  /* -------------------------------------------------------
   STUDIES — LABORATORIO
  ------------------------------------------------------- */

  async listLaboratoryOrders(params: {
    page?: number;
    limit?: number;
    search?: string;
    estado?: string;
    date?: string;
  } = {}) {
    const query = new URLSearchParams({
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 20),
      ...(params.search ? { search: params.search } : {}),
      ...(params.estado ? { estado: params.estado } : {}),
      ...(params.date ? { date: params.date } : {}),
    });

    const response = await fetch(
      `${API_ENDPOINTS.BASE}/studies/orders?${query}`,
      { headers: authHeaders() }
    );

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Error al obtener órdenes");
    }

    return result;
  },

  /* -------------------------------------------------------
     STUDIES — NUTRICIONISTA
  ------------------------------------------------------- */

  async listNutritionistStudies(params: {
    page?: number;
    limit?: number;
    search?: string;
    estado?: string;
    date?: string;
  } = {}) {
    const queryObj: Record<string, string> = {
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 20),
    };

    if (params.search) queryObj.search = params.search;
    if (params.estado) queryObj.estado = params.estado;
    if (params.date) queryObj.date = params.date;

    const query = new URLSearchParams(queryObj);

    const response = await fetch(
      `${API_ENDPOINTS.BASE}/studies?${query.toString()}`,
      { headers: authHeaders() }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Error al obtener estudios");
    }

    return result;
  },

  async markAsReceived(id: string) {
    const response = await fetch(
      `${API_ENDPOINTS.BASE}/studies/${id}/receive`,
      {
        method: "PATCH",
        headers: authHeaders(),
      }
    );

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Error al marcar como recibido");
    }

    return result;
  },

  async startAnalysis(id: string) {
    const response = await fetch(
      `${API_ENDPOINTS.BASE}/studies/${id}/start-analysis`,
      {
        method: "PATCH",
        headers: authHeaders(),
      }
    );

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Error al iniciar análisis");
    }

    return result;
  },

  async uploadStudyJson(id: string, payload: any) {
    const response = await fetch(
      `${API_ENDPOINTS.BASE}/studies/${id}/upload-json`,
      {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Error al subir JSON del estudio");
    }

    return result;
  },

  async rejectStudy(id: string, payload: { reason: string }) {
    const response = await fetch(
      `${API_ENDPOINTS.BASE}/studies/${id}/reject`,
      {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Error al rechazar estudio");
    }

    return result;
  },

  async reassignStudy(id: string, payload: { newUserId: string }) {
    const response = await fetch(
      `${API_ENDPOINTS.BASE}/studies/${id}/reassign`,
      {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Error al reasignar estudio");
    }

    return result;
  },

  async getStudyById(id: string) {
    const response = await fetch(
      `${API_ENDPOINTS.BASE}/studies/${id}`,
      {
        headers: authHeaders(),
      }
    );

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Error al obtener detalle del estudio");
    }

    return result;
  },
};