<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 px-4"
  >
    <div class="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Criar Usuário</h1>
        <p class="text-gray-600 text-sm">Disponível apenas para administradores</p>
      </div>

      <Alert
        v-if="error"
        type="error"
        title="Erro no cadastro"
        :message="error"
      />

      <Alert
        v-if="successMessage"
        type="success"
        title="Usuário criado"
        :message="successMessage"
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
          v-model="username"
          type="text"
          label="Username"
          placeholder="novo_usuario"
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

        <label class="flex items-center gap-2 text-sm text-gray-700">
          <input v-model="isAdminUser" type="checkbox" class="rounded border-gray-300" />
          Criar usuário como administrador
        </label>

        <Button
          type="submit"
          :loading="loading"
          :disabled="password !== confirmPassword"
          class="w-full"
        >
          Criar usuário
        </Button>
      </FormGroup>

      <div class="mt-6 text-center">
        <router-link to="/dashboard" class="text-blue-600 hover:underline text-sm">
          Voltar para o dashboard
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/modules/auth/ui/stores/authStore";
import FormGroup from "@/shared/components/FormGroup.vue";
import Input from "@/shared/components/Input.vue";
import Button from "@/shared/components/Button.vue";
import Alert from "@/shared/components/Alert.vue";

const authStore = useAuthStore();

const fullName = ref("");
const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const isAdminUser = ref(false);
const loading = ref(false);
const error = ref("");
const successMessage = ref("");

async function handleRegister() {
  if (password.value !== confirmPassword.value) {
    error.value = "As senhas não coincidem";
    return;
  }

  loading.value = true;
  error.value = "";
  successMessage.value = "";

  if (!authStore.isAdmin) {
    error.value = "Apenas administradores podem criar novos usuários.";
    loading.value = false;
    return;
  }

  try {
    await authStore.register(
      username.value,
      password.value,
      fullName.value,
      isAdminUser.value,
    );
    successMessage.value = "Usuário criado com sucesso.";
    fullName.value = "";
    username.value = "";
    password.value = "";
    confirmPassword.value = "";
    isAdminUser.value = false;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Erro ao criar usuário";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped></style>
