<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div
      v-for="model in availableModels"
      :key="model.id"
      class="bg-white rounded-lg p-4 hover:shadow-sm transition-all duration-200"
    >
      <div class="flex justify-between items-start">
        <div>
          <h3 class="font-medium text-gray-900">{{ model.name }}</h3>
          <p class="text-sm text-gray-500 mt-1">
            {{ model.tables?.length || 0 }} tables
          </p>
        </div>
        <div class="flex space-x-2">
          <router-link
            :to="{ name: 'EditModel', params: { id: model.id } }"
            class="p-1 text-gray-400 hover:text-blue-500"
            title="Edit Model"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
              />
            </svg>
          </router-link>
          <button
            @click="confirmDelete(model)"
            class="p-1 text-gray-400 hover:text-red-500"
            title="Delete Model"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Only show table list if there are tables -->
      <div v-if="model.tables?.length" class="mt-3 flex flex-wrap gap-2">
        <span
          v-for="table in model.tables.slice(0, 3)"
          :key="table.name"
          class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
        >
          {{ table.name }}
        </span>
        <span
          v-if="model.tables.length > 3"
          class="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded"
        >
          +{{ model.tables.length - 3 }} more
        </span>
      </div>

      <!-- Use Model Button -->
      <div class="mt-4 flex justify-end">
        <button
          @click="useModel(model)"
          class="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
        >
          Use This Model
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!availableModels.length"
      class="col-span-full text-center py-8 text-gray-500"
    >
      No saved models yet
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useModelStore } from "../../stores/modelStore";
import { useGeneratorStore } from "../../stores/generatorStore";

const router = useRouter();
const modelStore = useModelStore();
const generatorStore = useGeneratorStore();
const availableModels = computed(() => modelStore.models);

const useModel = (model) => {
  generatorStore.setSelectedModel(model);
  generatorStore.setSourceType("model");
  if (model.tables && model.tables.length > 0) {
    generatorStore.setSelectedTables(model.tables);
  }
  router.push({ name: "Templates" });
};

const confirmDelete = (model) => {
  if (confirm(`Are you sure you want to delete "${model.name}"?`)) {
    modelStore.deleteModel(model.id);
  }
};

defineEmits(["select"]);
</script>
