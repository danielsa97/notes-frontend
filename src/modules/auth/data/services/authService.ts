import { apiRequest } from "@/core/utils/apiClient";

type LoginResponse = {
  token: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    isAdmin: boolean;
    createdAt: string;
    updatedAt: string;
  };
};

type RegisterPayload = {
  username: string;
  password: string;
  fullName: string;
  isAdmin?: boolean;
};

export const authService = {
  async register(payload: RegisterPayload, token: string) {
    return apiRequest<{ user: unknown }>("/auth/register", {
      method: "POST",
      body: payload,
      token,
    });
  },

  async login(username: string, password: string) {
    return apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: {
        username,
        password,
      },
    });
  },

  async verifySession(token: string) {
    return apiRequest<LoginResponse["user"]>("/auth/me", {
      method: "GET",
      token,
    });
  },

  async logout() {
    return Promise.resolve();
  },
};
