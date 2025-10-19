import api from "./axios";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  tenantName?: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  tenantId: string;
  n8nUserId?: number;
  isActive: boolean;
  emailVerified: boolean;
}

export interface AuthResponse {
  user: User;
  expiresIn: number;
}

export const authApi = {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
    localStorage.clear();
  },

  async verify(): Promise<{ user: User }> {
    const response = await api.post("/auth/verify");
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post("/auth/refresh", { refreshToken });
    return response.data;
  },
};
