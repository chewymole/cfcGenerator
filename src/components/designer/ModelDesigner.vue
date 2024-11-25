<template>
  <div class="flex h-screen">
    <!-- Sidebar Navigation -->
    <div class="w-64 border-r bg-gray-50">
      <div class="p-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">Models</h2>
          <span v-if="loading" class="text-sm text-blue-500">Loading...</span>
        </div>

        <!-- Actions -->
        <div class="space-y-2 mb-4">
          <button
            @click="createNewModel"
            class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create New Model
          </button>
          <button
            @click="$refs.importInput.click()"
            class="w-full px-4 py-2 border rounded hover:bg-gray-50"
          >
            Import Model
          </button>
          <input
            ref="importInput"
            type="file"
            accept=".json"
            class="hidden"
            @change="handleImport"
          />
        </div>

        <!-- Model List -->
        <div v-if="modelStore.models.length" class="space-y-2">
          <div
            v-for="model in modelStore.models"
            :key="model.id"
            @click="selectModel(model)"
            class="p-2 rounded cursor-pointer hover:bg-gray-200"
            :class="{ 'bg-gray-200': currentModelId === model.id }"
          >
            <div class="flex items-center justify-between">
              <span>{{ model.name }}</span>
              <button
                @click.stop="deleteModel(model)"
                class="text-red-500 hover:text-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
        <div v-else-if="!loading" class="text-gray-500 text-center py-4">
          No models available
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useModelStore } from "../../stores/modelStore";
import { useToast } from "vue-toastification";

const router = useRouter();
const route = useRoute();
const modelStore = useModelStore();
const toast = useToast();

const loading = ref(true);
const importInput = ref(null);

const currentModelId = computed(() => route.params.id);

onMounted(async () => {
  try {
    await modelStore.loadModels();
    console.log("Models loaded:", modelStore.models);
  } catch (error) {
    console.error("Error loading models:", error);
    toast.error("Failed to load models");
  } finally {
    loading.value = false;
  }
});

function createNewModel() {
  router.push({ name: "NewModel" });
}

function selectModel(model) {
  router.push({
    name: "EditModel",
    params: { id: model.id },
  });
}

async function deleteModel(model) {
  if (confirm(`Are you sure you want to delete "${model.name}"?`)) {
    try {
      await modelStore.deleteModel(model.id);
      toast.success("Model deleted successfully");
      if (currentModelId.value === model.id) {
        router.push({ name: "ModelDesigner" });
      }
    } catch (error) {
      console.error("Error deleting model:", error);
      toast.error("Failed to delete model");
    }
  }
}

async function handleImport(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const content = await file.text();
    const importedModel = JSON.parse(content);

    // Validate imported model
    if (!importedModel.name || !importedModel.tables) {
      throw new Error("Invalid model format");
    }

    // Create new model from imported data
    const newModel = await modelStore.importModel(importedModel);

    // Clear the input
    event.target.value = "";

    // Navigate to the imported model
    router.push({
      name: "EditModel",
      params: { id: newModel.id },
    });
  } catch (error) {
    console.error("Error importing model:", error);
    toast.error("Failed to import model: " + error.message);
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
