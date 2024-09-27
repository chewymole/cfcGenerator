<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Select Tables</h2>
    <div v-if="loading" class="text-gray-600">Loading tables...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>
    <div v-else-if="!tables || tables.length === 0" class="text-gray-600">
      No tables found for this data source.
    </div>
    <div v-else>
      <EnhancedTableSelector
        :tables="tables"
        @update:selectedTables="handleSelectedTables"
      />
      <!-- <div v-for="table in tables" :key="table" class="mb-2">
        <label class="flex items-center">
          <input
            type="checkbox"
            :value="table"
            v-model="selectedTables"
            class="mr-2"
          />
          {{ table }}
        </label>
      </div> -->

      <button
        @click="submitSelection"
        class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        :disabled="selectedTables.length === 0"
      >
        Continue
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import EnhancedTableSelector from "./EnhancedTableSelector.vue";
import { useGeneratorStore } from "../stores/generatorStore";
import { fetchTables } from "../services/api";
import { log, error as logError } from "../utils/logger";
const router = useRouter();
const store = useGeneratorStore();
const tables = ref([]);
const selectedTables = ref([]);
const loading = ref(true);
const error = ref("");

onMounted(async () => {
  log("TableSelector mounted");
  try {
    const dataSource = store.dataSource;
    log("Data source from store:", dataSource);
    if (!dataSource) {
      throw new Error("No data source selected");
    }
    log("Fetching tables for data source:", dataSource);
    const result = await fetchTables(dataSource);
    log("Fetch tables result:", result);
    if (result.success && Array.isArray(result.tables)) {
      tables.value = result.tables.filter(
        (table) => table && table.trim() !== ""
      );
      log("Tables set:", tables.value);
      if (tables.value.length === 0) {
        error.value = "No tables found for this data source.";
      }
    } else {
      throw new Error(result.message || "Failed to fetch tables");
    }
  } catch (err) {
    logError("Error in TableSelector:", err);
    error.value = err.message || "An error occurred while fetching tables";
  } finally {
    loading.value = false;
    log("TableSelector loading complete. Tables:", tables.value);
  }
});

function handleSelectedTables(selected) {
  selectedTables.value = selected;
  store.setSelectedTables(selectedTables.value);
}

function submitSelection() {
  log("Submitting table selection:", selectedTables.value);
  if (selectedTables.value.length > 0) {
    router.push({ name: "Templates" });
  }
}
</script>
