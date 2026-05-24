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
    status: "ENABLED" | "DISABLED" | "DELETED";
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
};

type RegisteredUser = {
  id: string;
  username: string;
  full_name: string;
  is_admin: boolean;
  status: "ENABLED" | "DISABLED" | "DELETED";
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

type UpdateUserPayload = {
  fullName?: string;
  isAdmin?: boolean;
  status?: "ENABLED" | "DISABLED" | "DELETED";
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
    return apiRequest<{ ok: boolean; transferredHotels?: Hotel[] }>(
      `/auth/users/${userId}/hotels`,
      {
        method: "PUT",
        body: { hotelIds },
        token,
      },
    );
  },

  async updateUser(userId: string, payload: UpdateUserPayload, token: string) {
    return apiRequest<{ user: User }>(`/auth/users/${userId}`, {
      method: "PUT",
      body: payload,
      token,
    });
  },

  async updateUserPassword(userId: string, newPassword: string, token: string) {
    return apiRequest<{ ok: boolean }>(`/auth/users/${userId}/password`, {
      method: "PATCH",
      body: { newPassword },
      token,
    });
  },

  async softDeleteUser(userId: string, token: string) {
    return apiRequest<{ ok: boolean; transferredHotels?: Hotel[] }>(
      `/auth/users/${userId}`,
      {
        method: "DELETE",
        token,
      },
    );
  },

  async toggleUserStatus(userId: string, token: string) {
    return apiRequest<{ user: User }>(`/auth/users/${userId}/toggle-status`, {
      method: "PATCH",
      token,
    });
  },
};
