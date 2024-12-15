<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-blue-600 text-white p-4">
      <h1 class="text-2xl font-bold">
        VU-3 Code Generator
      </h1>
      <nav class="mt-4">
        <router-link
          v-for="(step, index) in steps"
          :key="step.name"
          :to="{ name: step.name }"
          class="mr-4 px-3 py-2 rounded"
          :class="{
            'bg-blue-500': currentStep === index + 1,
            'hover:bg-blue-700': currentStep >= index + 1,
            'opacity-50 cursor-not-allowed': currentStep < index + 1,
          }"
          :disabled="currentStep < index + 1"
        >
          {{ step.label }}
        </router-link>

        <div class="flex items-center float-right">
          <button
            class="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Settings"
            @click="showSettings = true"
          >
            <svg
              class="w-6 h-6 text-white-600 hover:text-gray-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </nav>
      <Modal
        :show="showSettings"
        title="Settings"
        @close="showSettings = false"
      >
        <DebugSettings />
      </Modal>
    </header>
    <main class="p-4">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useGeneratorStore } from "./stores/generatorStore";
import { useModelStore } from "./stores/modelStore";
import DebugSettings from "./components/DebugSettings.vue";
import Modal from "./components/common/Modal.vue";

const store = useGeneratorStore();
const modelStore = useModelStore();
const showSettings = ref(false);

const steps = [
  { name: "DataSource", label: "Data Source" },
  { name: "Tables", label: "Tables" },
  { name: "Templates", label: "Templates" },
  { name: "Generate", label: "Generate" },
  { name: "ViewCode", label: "View Code" },
];

const currentStep = computed(() => store.currentStep);
</script>
<style>
nav {
  padding: 1rem;
}
nav a {
  margin-right: 1rem;
}
.disabled {
  pointer-events: none;
  opacity: 0.6;
}
</style>
