<template>
  <div class="flex h-screen bg-gray-50">
    <Sidebar />
    <div
      v-if="isMobileSidebarOpen"
      class="fixed inset-0 z-40 bg-black/40 md:hidden"
      @click="isMobileSidebarOpen = false"
    />
    <Sidebar
      mobile
      :isOpen="isMobileSidebarOpen"
      @close="isMobileSidebarOpen = false"
    />

    <div class="flex-1 flex flex-col overflow-hidden">
      <Header
        :showMobileMenuButton="true"
        @openMobileMenu="isMobileSidebarOpen = true"
      />
      <main class="flex-1 overflow-y-auto">
        <slot></slot>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Header from "@/modules/auth/ui/components/Header.vue";
import Sidebar from "@/modules/auth/ui/components/Sidebar.vue";

const isMobileSidebarOpen = ref(false);
</script>

<style scoped></style>
