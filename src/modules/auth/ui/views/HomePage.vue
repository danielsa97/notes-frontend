<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 px-4"
  >
    <div class="text-center">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        Hotel Mindu
      </h1>
      <p class="text-xl text-gray-600 mb-8">
        Sistema de Gestão de Atividades e Tarefas
      </p>

      <div class="flex gap-4 justify-center">
        <router-link
          to="/login"
          class="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Entrar
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
