import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authService } from "@/modules/auth/data/services/authService";
import useLocalStorage from "@/core/utils/composables/useLocalStorage";
import type { User } from "@/core/utils/types";

export const useAuthStore = defineStore("auth", () => {
  const { value: storedUser, setItem: setStoredUser } = useLocalStorage(
    "auth_user",
    null,
  );

  const user = ref<User | null>(storedUser.value);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => user.value !== null);

  async function login(email: string, password: string) {
    loading.value = true;
    error.value = null;
    try {
      const { data, error: err } = await authService.login(email, password);
      if (err) throw err;

      // Simulate user object - in real app, fetch from database
      const userData: User = {
        id: data?.user?.id || "",
        email: data?.user?.email || email,
        full_name: email.split("@")[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      user.value = userData;
      setStoredUser(userData);
      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Login failed";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function register(email: string, password: string, fullName: string) {
    loading.value = true;
    error.value = null;
    try {
      const { data, error: err } = await authService.register(
        email,
        password,
        fullName,
      );
      if (err) throw err;
      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Registration failed";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    loading.value = true;
    error.value = null;
    try {
      const { error: err } = await authService.logout();
      if (err) throw err;
      user.value = null;
      setStoredUser(null);
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Logout failed";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function resetPassword(email: string) {
    loading.value = true;
    error.value = null;
    try {
      const { error: err } = await authService.resetPassword(email);
      if (err) throw err;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Password reset failed";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function checkAuth() {
    const storedAuth = localStorage.getItem("auth_user");
    if (storedAuth) {
      user.value = JSON.parse(storedAuth);
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    resetPassword,
    checkAuth,
  };
});
