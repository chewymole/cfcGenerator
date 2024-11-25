<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-6">Create New Model</h2>

    <!-- Step 1: Source Selection -->
    <div v-if="currentStep === 1">
      <h3 class="text-lg font-medium mb-4">Choose Data Source</h3>
      <div class="grid grid-cols-3 gap-4">
        <div
          v-for="source in sources"
          :key="source.id"
          @click="selectSource(source)"
          class="border rounded-lg p-4 cursor-pointer hover:border-blue-500"
          :class="{
            'border-blue-500 bg-blue-50': selectedSource === source.id,
          }"
        >
          <h4 class="font-medium mb-2">{{ source.name }}</h4>
          <p class="text-sm text-gray-600">{{ source.description }}</p>
        </div>
      </div>

      <!-- Source-specific Component -->
      <div v-if="selectedSource" class="mt-6">
        <component
          :is="sourceComponents[selectedSource]"
          @tables-loaded="onTablesLoaded"
          @parsing-status="handleParsingStatus"
          @api-status="handleApiStatus"
        />
      </div>

      <!-- Navigation -->
      <div class="mt-6 flex justify-between">
        <button
          @click="router.push({ name: 'ModelDesigner' })"
          class="px-4 py-2 border rounded"
        >
          Cancel
        </button>
        <div class="relative">
          <button
            @click="nextStep"
            class="px-4 py-2 rounded"
            :class="{
              'bg-blue-500 hover:bg-blue-600 text-white':
                !isParsingSQL && canProceed,
              'bg-gray-400 cursor-not-allowed text-white':
                isParsingSQL || !canProceed,
            }"
            :disabled="isParsingSQL || !canProceed"
            :title="getNextButtonTooltip"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Step 2: Model Configuration -->
    <div v-else>
      <form @submit.prevent="saveModel" class="space-y-6">
        <!-- Basic Info -->
        <div>
          <label class="block text-sm font-medium mb-2">Model Name</label>
          <input
            v-model="modelName"
            type="text"
            class="w-full px-4 py-2 border rounded"
            :disabled="saving"
            required
          />
        </div>

        <!-- Model Type -->
        <div>
          <label class="block text-sm font-medium mb-2">Model Type</label>
          <select
            v-model="modelType"
            class="w-full px-4 py-2 border rounded"
            :disabled="saving"
          >
            <option value="composite">Composite</option>
            <option value="inheritance">Inheritance</option>
            <option value="service">Service</option>
          </select>
        </div>

        <!-- Selected Tables -->
        <div v-if="availableTables.length">
          <h3 class="text-lg font-medium mb-4">Available Tables</h3>
          <div class="grid grid-cols-3 gap-4">
            <div
              v-for="table in availableTables"
              :key="table.name"
              class="border rounded p-4"
            >
              <div class="flex items-center justify-between">
                <span>{{ table.name }}</span>
                <input
                  type="checkbox"
                  :checked="isTableSelected(table)"
                  @change="toggleTable(table)"
                  :disabled="saving"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Error Display -->
        <div
          v-if="error"
          class="bg-red-50 border border-red-200 text-red-600 p-4 rounded"
        >
          {{ error }}
        </div>

        <!-- Form Actions -->
        <div class="flex justify-between">
          <button
            type="button"
            @click="currentStep = 1"
            class="px-4 py-2 border rounded"
            :disabled="saving"
          >
            Back
          </button>
          <div class="space-x-2">
            <button
              type="button"
              @click="cancel"
              class="px-4 py-2 border rounded"
              :disabled="saving"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-500 text-white rounded"
              :disabled="saving || !isValid"
            >
              {{ saving ? "Saving..." : "Save Model" }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useModelStore } from "../../stores/modelStore";
import { useToast } from "vue-toastification";
import SQLImport from "./sources/SQLImport.vue";
import APISource from "./sources/APISource.vue";
import ManualEntry from "./sources/ManualEntry.vue";

const router = useRouter();
const modelStore = useModelStore();
const toast = useToast();

// Step management
const currentStep = ref(1);
const selectedSource = ref(null);
const availableTables = ref([]);
const selectedTables = ref([]);

// Model data
const modelName = ref("");
const modelType = ref("composite");
const saving = ref(false);
const error = ref(null);

// Source definitions
const sources = [
  {
    id: "api",
    name: "API Connection",
    description: "Connect to an existing API to fetch table definitions",
  },
  {
    id: "sql",
    name: "SQL Import",
    description: "Import table definitions from SQL file",
  },
  {
    id: "manual",
    name: "Manual Entry",
    description: "Manually define your tables and columns",
  },
];

const sourceComponents = {
  api: APISource,
  sql: SQLImport,
  manual: ManualEntry,
};

// Computed properties
const isValid = computed(() => {
  return modelName.value.trim() && selectedTables.value.length > 0;
});

const canProceed = computed(() => {
  if (currentStep.value === 1) {
    // Must have a source selected
    if (!selectedSource.value) {
      return false;
    }

    // Different validation based on source type
    switch (selectedSource.value) {
      case "sql":
        // For SQL import: require successful parsing and at least one table
        return (
          !isParsingSQL.value &&
          !parsingError.value &&
          availableTables.value.length > 0
        );

      case "api":
        // For API: require successful connection and at least one table
        return (
          !isLoading.value &&
          !apiError.value &&
          availableTables.value.length > 0
        );

      case "manual":
        // For manual entry: require at least one valid table
        return (
          availableTables.value.length > 0 &&
          availableTables.value.every(
            (table) =>
              table.name &&
              table.columns?.length > 0 &&
              table.columns.some((col) => col.isPrimaryKey)
          )
        );

      default:
        return false;
    }
  }

  // For step 2 (model configuration)
  if (currentStep.value === 2) {
    return (
      modelName.value.trim() &&
      selectedTables.value.length > 0 &&
      modelType.value
    );
  }

  return false;
});

const isParsingSQL = ref(false);
const parsingError = ref("");
const isLoading = ref(false);
const apiError = ref(null);

function handleParsingStatus(isParsing, error = null) {
  isParsingSQL.value = isParsing;
  parsingError.value = error;
}

function handleApiStatus(loading, error = null) {
  isLoading.value = loading;
  apiError.value = error;
}

function handleTablesLoaded(tables) {
  console.log("Tables loaded:", tables);
  availableTables.value = tables;
}

// Methods
function selectSource(source) {
  selectedSource.value = source.id;
  availableTables.value = [];
  selectedTables.value = [];
}

function onTablesLoaded(tables) {
  console.log("Tables loaded:", tables);
  availableTables.value = tables;
}

function nextStep() {
  if (canProceed.value) {
    currentStep.value = 2;
  }
}

function isTableSelected(table) {
  return selectedTables.value.some((t) => t.name === table.name);
}

function toggleTable(table) {
  const index = selectedTables.value.findIndex((t) => t.name === table.name);
  if (index === -1) {
    selectedTables.value.push(table);
  } else {
    selectedTables.value.splice(index, 1);
  }
}

async function saveModel() {
  if (!isValid.value) return;

  saving.value = true;
  error.value = null;

  try {
    const newModel = await modelStore.createModel({
      name: modelName.value,
      type: modelType.value,
      tables: selectedTables.value,
      source: selectedSource.value,
    });

    console.log("Model saved:", newModel);

    router.push({
      name: "EditModel",
      params: { id: newModel.id },
    });
  } catch (err) {
    console.error("Error saving model:", err);
    error.value = err.message;
  } finally {
    saving.value = false;
  }
}

function cancel() {
  router.push({ name: "ModelDesigner" });
}

const getNextButtonTooltip = computed(() => {
  if (isParsingSQL.value) {
    return "Please wait while SQL is being parsed...";
  }
  if (parsingError.value) {
    return "Please fix SQL parsing errors before proceeding";
  }
  if (!selectedSource.value) {
    return "Please select a data source";
  }
  if (!availableTables.value.length) {
    return "Please add at least one table";
  }
  if (currentStep.value === 2 && !modelName.value.trim()) {
    return "Please enter a model name";
  }
  if (currentStep.value === 2 && !selectedTables.value.length) {
    return "Please select at least one table";
  }
  return "";
});
</script>
