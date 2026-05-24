import {
  createRouter,
  createWebHistory,
  RouteRecordRaw,
  NavigationGuardNext,
  RouteLocationNormalized,
} from "vue-router";
import { useAuthStore } from "@/modules/auth/ui/stores/authStore";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/login",
    component: () => import("@/modules/auth/ui/views/LoginPage.vue"),
    meta: { requiresGuest: true },
  },
  {
    path: "/users/new",
    component: () => import("@/modules/auth/ui/views/RegisterPage.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/dashboard",
    component: () => import("@/modules/hotels/ui/views/DashboardPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/hotels",
    component: () => import("@/modules/hotels/ui/views/HotelsPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/dashboard",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guards
router.beforeEach(
  async (
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) => {
    const authStore = useAuthStore();

    // Check if route requires authentication
    if (to.meta.requiresAuth) {
      if (!authStore.isAuthenticated) {
        next("/login");
      } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
        next("/dashboard");
      } else {
        next();
      }
    }
    // Check if route requires guest (no authentication)
    else if (to.meta.requiresGuest) {
      if (authStore.isAuthenticated) {
        next("/dashboard");
      } else {
        next();
      }
    }
    // No restrictions
    else {
      next();
    }
  },
);

export default router;
