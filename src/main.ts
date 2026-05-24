import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { useAuthStore } from "./modules/auth/ui/stores/authStore";
import { i18n } from "./core/i18n";
import "./assets/styles.css";

const app = createApp(App);

app.use(createPinia());
app.use(i18n);

// Check auth status before routing
const authStore = useAuthStore();
await authStore.checkAuth();

app.use(router);

app.mount("#app");
