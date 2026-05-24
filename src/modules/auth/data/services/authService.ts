import { apiRequest } from "@/core/utils/apiClient";
import type { Hotel, User } from "@/core/utils/types";

type LoginResponse = {
  token: string;
  hotels: Hotel[];
  user: {
    id: string;
    username: string;
    fullName: string;
    isAdmin: boolean;
    createdAt: string;
    updatedAt: string;
  };
};

type RegisteredUser = {
  id: string;
  username: string;
  full_name: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

type RegisterPayload = {
  username: string;
  password: string;
  fullName: string;
  isAdmin?: boolean;
};

export const authService = {
  async register(payload: RegisterPayload, token: string) {
    return apiRequest<{ user: RegisteredUser }>("/auth/register", {
      method: "POST",
      body: payload,
      token,
    });
  },

  async login(username: string, password: string) {
    return apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: { username, password },
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

  async listUsers(token: string) {
    return apiRequest<{ users: User[] }>("/auth/users", { token });
  },

  async updateUserHotels(userId: string, hotelIds: string[], token: string) {
    return apiRequest<{ ok: boolean }>(`/auth/users/${userId}/hotels`, {
      method: "PUT",
      body: { hotelIds },
      token,
    });
  },
};
