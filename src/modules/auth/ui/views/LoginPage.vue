<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 px-4"
  >
    <div class="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Hotel Mindu</h1>
        <p class="text-gray-600 text-sm">Faça login para continuar</p>
      </div>

      <Alert
        v-if="error"
        type="error"
        title="Erro ao fazer login"
        :message="error"
      />

      <FormGroup @submit="handleLogin" class="space-y-4">
        <Input
          v-model="email"
          type="email"
          label="Email"
          placeholder="seu@email.com"
          required
        />

        <Input
          v-model="password"
          type="password"
          label="Senha"
          placeholder="••••••••"
          required
        />

        <Button type="submit" :loading="loading" class="w-full">
          Entrar
        </Button>
      </FormGroup>

      <div class="mt-6 space-y-3">
        <div class="text-center">
          <router-link
            to="/register"
            class="text-blue-600 hover:underline text-sm"
          >
            Não tem conta? Registre-se aqui
          </router-link>
        </div>
        <div class="text-center">
          <button
            class="text-blue-600 hover:underline text-sm"
            @click="showResetModal = true"
          >
            Esqueceu sua senha?
          </button>
        </div>
      </div>

      <!-- Password Reset Modal -->
      <Modal
        :isOpen="showResetModal"
        title="Recuperar Senha"
        @close="showResetModal = false"
        @confirm="handleResetPassword"
      >
        <Input
          v-model="resetEmail"
          type="email"
          label="Email"
          placeholder="seu@email.com"
          required
        />
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/modules/auth/ui/stores/authStore";
import FormGroup from "@/shared/components/FormGroup.vue";
import Input from "@/shared/components/Input.vue";
import Button from "@/shared/components/Button.vue";
import Alert from "@/shared/components/Alert.vue";
import Modal from "@/shared/components/Modal.vue";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const resetEmail = ref("");
const loading = ref(false);
const error = ref("");
const showResetModal = ref(false);

async function handleLogin() {
  loading.value = true;
  error.value = "";
  try {
    await authStore.login(email.value, password.value);
    router.push("/dashboard");
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Erro ao fazer login";
  } finally {
    loading.value = false;
  }
}

async function handleResetPassword() {
  try {
    await authStore.resetPassword(resetEmail.value);
    alert("Email de recuperação enviado!");
    showResetModal.value = false;
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Erro ao recuperar senha";
  }
}
</script>

<style scoped></style>
