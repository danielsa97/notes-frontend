import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authService } from "@/modules/auth/data/services/authService";
import useLocalStorage from "@/core/utils/composables/useLocalStorage";
import type { User } from "@/core/utils/types";
import { i18n } from "@/core/i18n";

export const useAuthStore = defineStore("auth", () => {
  const t = i18n.global.t;

  const { value: storedUser, setItem: setStoredUser } = useLocalStorage(
    "auth_user",
    null,
  );
  const { value: storedToken, setItem: setStoredToken } = useLocalStorage(
    "auth_token",
    null,
  );

  const user = ref<User | null>(storedUser.value);
  const token = ref<string | null>(storedToken.value);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => user.value !== null);
  const isAdmin = computed(() => user.value?.is_admin === true);

  async function login(username: string, password: string) {
    loading.value = true;
    error.value = null;
    try {
      const data = await authService.login(username, password);
      const userData: User = {
        id: data.user.id,
        username: data.user.username,
        full_name: data.user.fullName,
        is_admin: data.user.isAdmin,
        created_at: data.user.createdAt,
        updated_at: data.user.updatedAt,
      };

      user.value = userData;
      token.value = data.token;
      setStoredUser(userData);
      setStoredToken(data.token);
      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : t("auth.errors.loginFailed");
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function register(
    username: string,
    password: string,
    fullName: string,
    isAdminUser = false,
  ) {
    if (!token.value) {
      throw new Error(t("auth.sessionInvalid"));
    }

    loading.value = true;
    error.value = null;
    try {
      return await authService.register(
        {
          username,
          password,
          fullName,
          isAdmin: isAdminUser,
        },
        token.value,
      );
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : t("auth.errors.registrationFailed");
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    loading.value = true;
    error.value = null;
    try {
      await authService.logout();
      user.value = null;
      token.value = null;
      setStoredUser(null);
      setStoredToken(null);
      // Clear active workspace
      const { useWorkspaceStore } = await import(
        "@/modules/hotels/ui/stores/workspaceStore"
      );
      useWorkspaceStore().clearActiveHotel();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : t("auth.errors.logoutFailed");
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function checkAuth() {
    const storedAuth = localStorage.getItem("auth_user");
    const storedAuthToken = localStorage.getItem("auth_token");

    if (storedAuth) {
      user.value = JSON.parse(storedAuth);
    }

    if (storedAuthToken) {
      token.value = JSON.parse(storedAuthToken);
    }

    if (!token.value) {
      user.value = null;
      setStoredUser(null);
      return;
    }

    try {
      const currentUser = await authService.verifySession(token.value);
      const normalizedUser: User = {
        id: currentUser.id,
        username: currentUser.username,
        full_name: currentUser.fullName,
        is_admin: currentUser.isAdmin,
        created_at: currentUser.createdAt,
        updated_at: currentUser.updatedAt,
      };
      user.value = normalizedUser;
      setStoredUser(normalizedUser);
    } catch {
      user.value = null;
      token.value = null;
      setStoredUser(null);
      setStoredToken(null);
    }
  }

  return {
    user,
    loading,
    error,
    token,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    checkAuth,
  };
});
