<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 px-4"
  >
    <div class="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Criar Conta</h1>
        <p class="text-gray-600 text-sm">Sistema de Gestão Hotel Mindu</p>
      </div>

      <Alert
        v-if="error"
        type="error"
        title="Erro no registro"
        :message="error"
      />

      <FormGroup @submit="handleRegister" class="space-y-4">
        <Input
          v-model="fullName"
          type="text"
          label="Nome Completo"
          placeholder="Seu Nome"
          required
        />

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

        <Input
          v-model="confirmPassword"
          type="password"
          label="Confirmar Senha"
          placeholder="••••••••"
          required
          :error="password !== confirmPassword ? 'As senhas não coincidem' : ''"
        />

        <Button
          type="submit"
          :loading="loading"
          :disabled="password !== confirmPassword"
          class="w-full"
        >
          Registrar
        </Button>
      </FormGroup>

      <div class="mt-6 text-center">
        <router-link to="/login" class="text-blue-600 hover:underline text-sm">
          Já tem conta? Faça login
        </router-link>
      </div>
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

const router = useRouter();
const authStore = useAuthStore();

const fullName = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const error = ref("");

async function handleRegister() {
  if (password.value !== confirmPassword.value) {
    error.value = "As senhas não coincidem";
    return;
  }

  loading.value = true;
  error.value = "";
  try {
    await authStore.register(email.value, password.value, fullName.value);
    alert("Conta criada com sucesso! Faça login para continuar.");
    router.push("/login");
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Erro ao registrar";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped></style>
