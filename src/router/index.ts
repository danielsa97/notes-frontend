import {
  createRouter,
  createWebHistory,
  RouteRecordRaw,
  NavigationGuardNext,
  RouteLocationNormalized,
} from "vue-router";
import { useAuthStore } from "@/modules/auth/ui/stores/authStore";
import { useWorkspaceStore } from "@/modules/hotels/ui/stores/workspaceStore";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/hotel-select",
  },
  {
    path: "/login",
    component: () => import("@/modules/auth/ui/views/LoginPage.vue"),
    meta: { requiresGuest: true },
  },
  {
    path: "/hotel-select",
    component: () => import("@/modules/hotels/ui/views/HotelSelectPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/users",
    component: () => import("@/modules/auth/ui/views/UsersPage.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/users/new",
    redirect: "/users",
  },
  {
    path: "/dashboard",
    component: () => import("@/modules/hotels/ui/views/DashboardPage.vue"),
    meta: { requiresAuth: true, requiresWorkspace: true },
  },
  {
    path: "/hotels",
    component: () => import("@/modules/hotels/ui/views/HotelsPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/rooms",
    component: () => import("@/modules/rooms/ui/views/RoomsPage.vue"),
    meta: { requiresAuth: true, requiresWorkspace: true },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/hotel-select",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(
  async (
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) => {
    const authStore = useAuthStore();

    if (to.meta.requiresAuth) {
      if (!authStore.isAuthenticated) {
        return next("/login");
      }
      if (to.meta.requiresAdmin && !authStore.isAdmin) {
        return next("/dashboard");
      }
      if (to.meta.requiresWorkspace) {
        const workspaceStore = useWorkspaceStore();
        if (!workspaceStore.activeHotel) {
          return next("/hotel-select");
        }
      }
      return next();
    }

    if (to.meta.requiresGuest) {
      if (authStore.isAuthenticated) {
        return next("/hotel-select");
      }
      return next();
    }

    return next();
  },
);

export default router;
