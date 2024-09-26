<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-blue-600 text-white p-4">
      <h1 class="text-2xl font-bold">Illudium PU-36 Code Generator</h1>
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
      </nav>
    </header>
    <main class="p-4">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useGeneratorStore } from "./stores/generatorStore";

const store = useGeneratorStore();

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
