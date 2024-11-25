<template>
  <div class="flex h-screen">
    <!-- Sidebar Navigation -->
    <div class="w-64 border-r bg-gray-50">
      <div class="p-4">
        <h2 class="text-lg font-semibold mb-4">Models</h2>
        <button
          @click="createNewModel"
          class="w-full mb-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Create New Model
        </button>

        <!-- Model List -->
        <div class="space-y-2">
          <div
            v-for="model in savedModels"
            :key="model.id"
            class="p-2 hover:bg-gray-200 cursor-pointer rounded"
            @click="selectModel(model)"
          >
            {{ model.name }}
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useModelStore } from "../stores/modelStore";

const router = useRouter();
const modelStore = useModelStore();
const savedModels = ref([]);

onMounted(async () => {
  savedModels.value = await modelStore.getSavedModels();
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
</script>
