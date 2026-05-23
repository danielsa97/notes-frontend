import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { useAuthStore } from "./modules/auth/ui/stores/authStore";
import "./assets/styles.css";

const app = createApp(App);

app.use(createPinia());

// Check auth status before routing
const authStore = useAuthStore();
authStore.checkAuth();

app.use(router);

app.mount("#app");
