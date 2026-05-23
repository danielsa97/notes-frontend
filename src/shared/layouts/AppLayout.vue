<template>
  <div class="flex h-screen bg-gray-50">
    <Sidebar />
    <div class="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main class="flex-1 overflow-y-auto">
        <slot></slot>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from "@/modules/auth/ui/components/Header.vue";
import Sidebar from "@/modules/auth/ui/components/Sidebar.vue";
</script>

<style scoped></style>
