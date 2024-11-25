<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Template Validation Errors (if any) -->
    <div
      v-if="templateErrors.length"
      class="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg"
    >
      <h3 class="text-red-800 font-medium mb-2">Template Validation Errors</h3>
      <ul class="list-disc list-inside text-sm text-red-700">
        <li v-for="(error, index) in templateErrors" :key="index">
          {{ error }}
        </li>
      </ul>
    </div>

    <!-- Source Type Tabs -->
    <div class="mb-8 border-b">
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="option in sourceOptions"
          :key="option.value"
          class="py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap"
          :class="[
            selectedOption === option.value
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
          ]"
          @click="selectedOption = option.value"
        >
          {{ option.label }}
        </button>
      </nav>
    </div>

    <!-- Main Content Area -->
    <div class="grid grid-cols-12 gap-8">
      <!-- Left Column -->
      <div class="col-span-12 lg:col-span-3">
        <div class="space-y-4">
          <h3 class="text-lg font-medium">
            {{ selectedOption === "datasource" ? "Data Source" : "Model" }}
          </h3>

          <!-- Data Source Options -->
          <div v-if="selectedOption === 'datasource'" class="space-y-2">
            <button
              class="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
              @click="showNewDataSourceModal = true"
            >
              + New Data Source
            </button>

            <!-- Commented out for now -->
            <!--
            <button
              class="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
              @click="showImportModal = true"
            >
              + Import Data
            </button>
            -->
          </div>

          <!-- Model Options -->
          <router-link
            v-else
            :to="{ name: 'EditModel', params: { id: 'new' } }"
            class="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            + New Model
          </router-link>
        </div>
      </div>

      <!-- Right Column -->
      <div class="col-span-12 lg:col-span-9">
        <!-- Recent Sources -->
        <div
          v-if="selectedOption === 'datasource' && hasCachedSources"
          class="bg-gray-50 rounded-lg p-6"
        >
          <div
            class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2"
          >
            <CachedSourceCard
              v-for="(cache, name) in validCachedSources"
              :key="name"
              :name="name"
              :timestamp="cache.timestamp"
              @use="useCachedDatasource"
              @remove="clearCache"
            />
          </div>
        </div>

        <!-- Saved Models -->
        <div
          v-if="selectedOption === 'model'"
          class="bg-gray-50 rounded-lg p-6"
        >
          <div class="max-h-[600px] overflow-y-auto pr-2">
            <ModelOptions @select="handleModelSelect" />
          </div>
        </div>
      </div>
    </div>

    <!-- New Data Source Modal -->
    <Modal
      v-if="showNewDataSourceModal"
      @close="showNewDataSourceModal = false"
    >
      <template #title>New Data Source</template>
      <template #content>
        <DataSourceInput
          v-model="dataSource"
          :error="error"
          @validate="validateAndCloseModal"
        />
      </template>
    </Modal>

    <!-- Import Data Modal (commented out for now) -->
    <!--
    <Modal v-if="showImportModal" @close="showImportModal = false">
      <template #title>Import Data</template>
      <template #content>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Import URL
            </label>
            <input
              v-model="importUrl"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter API endpoint URL"
            />
          </div>
          <button
            @click="importData"
            class="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Import
          </button>
        </div>
      </template>
    </Modal>
    -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useGeneratorStore } from "../stores/generatorStore";
import { useModelStore } from "../stores/modelStore";
import { loadTemplates } from "../services/templateService";
import { validateDataSource as validateDataSourceAPI } from "../services/api";
import OptionButton from "./common/OptionButton.vue";
import CachedSourceCard from "./common/CachedSourceCard.vue";
import DataSourceInput from "./common/DataSourceInput.vue";
import ModelOptions from "./common/ModelOptions.vue";
import Modal from "./common/Modal.vue";
import { TemplateValidator } from "../services/templateValidator";

const router = useRouter();
const generatorStore = useGeneratorStore();
const modelStore = useModelStore();
const selectedOption = ref("datasource");
const dataSource = ref("");
const error = ref("");
const showNewDataSourceModal = ref(false);
const showImportModal = ref(false);
const importUrl = ref("");
const templateErrors = ref([]);

const sourceOptions = [
  { value: "datasource", label: "Database Source" },
  { value: "model", label: "Custom Model" },
];

// Only show cached sources that have tableXML
const validCachedSources = computed(() => {
  const sources = generatorStore.cachedDatasources;
  return Object.fromEntries(
    Object.entries(sources).filter(([_, cache]) => cache.tables)
  );
});

const hasCachedSources = computed(
  () => Object.keys(validCachedSources.value).length > 0
);

// Load and validate templates on startup
onMounted(async () => {
  try {
    const result = await loadTemplates();
    if (!result.success) {
      if (result.errors && Array.isArray(result.errors)) {
        templateErrors.value = result.errors;
      } else {
        templateErrors.value.push(result.message);
      }
    }
  } catch (error) {
    templateErrors.value.push("Failed to load templates: " + error.message);
  }
});

// Commented out for now
/*
async function importData() {
  try {
    const response = await fetch(importUrl.value);
    const data = await response.json();
    
    if (data.success && data.tableXML) {
      generatorStore.setTablesXML(data.tableXML);
      showImportModal.value = false;
      router.push({ name: "Tables" });
    } else {
      error.value = data.message || 'Failed to import data';
    }
  } catch (err) {
    error.value = 'Error importing data: ' + err.message;
  }
}
*/

async function validateDataSource() {
  try {
    error.value = "";
    const result = await validateDataSourceAPI(dataSource.value);
    if (result.success) {
      generatorStore.setDataSource(dataSource.value);
      generatorStore.setSourceType("datasource");
      router.push({ name: "Tables" });
    } else {
      error.value = result.message || "Failed to validate data source";
    }
  } catch (err) {
    error.value = "An error occurred while validating the data source";
  }
}

function useCachedDatasource(name) {
  generatorStore.setDataSource(name);
  generatorStore.setSourceType("datasource");
  router.push({ name: "Tables" });
}

function clearCache(name) {
  generatorStore.clearDatasourceCache(name);
}

function handleModelSelect(model) {
  // Store the selected model in generator store
  generatorStore.setSelectedModel(model);
  generatorStore.setSourceType("model");

  // If model has tables, set them in the store
  if (model.tables && model.tables.length > 0) {
    generatorStore.setSelectedTables(model.tables);
  }

  router.push({
    name: "EditModel",
    params: { id: model.id },
  });
}

const validateAndCloseModal = async () => {
  await validateDataSource();
  if (!error.value) {
    showNewDataSourceModal.value = false;
  }
};
</script>
