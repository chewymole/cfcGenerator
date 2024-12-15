<template>
  <div class="flex h-full">
    <div class="flex-1 p-6">
      <div v-if="loading" class="text-center py-4">
        Loading...
      </div>

      <div v-else-if="error" class="text-red-500 text-center py-4">
        {{ error }}
      </div>

      <template v-else-if="model">
        <!-- Header Section -->
        <div class="bg-white p-6 border-b mb-6">
          <div class="grid grid-cols-2 gap-6 mb-6">
            <!-- Left side: Model details -->
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Model Name
                </label>
                <input
                  v-model="model.name"
                  class="w-full px-3 py-2 border rounded hover:border-gray-400 focus:border-blue-500 focus:outline-none"
                  :class="{ 'border-red-500': !model.name }"
                  placeholder="Model Name"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Base Path (optional)
                </label>
                <input
                  v-model="model.path"
                  class="w-full px-3 py-2 border rounded hover:border-gray-400 focus:border-blue-500 focus:outline-none"
                  placeholder="Base Path"
                >
              </div>
            </div>

            <!-- Right side: Database type and actions -->
            <div class="space-y-4">
              <div class="flex justify-end space-x-2">
                <button
                  class="px-4 py-2 border rounded hover:bg-gray-50"
                  :disabled="saving"
                  @click="exportModel"
                >
                  Export Model
                </button>
                <button
                  class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  :disabled="saving"
                  :title="
                    !isValid
                      ? validationErrors.join('\n')
                      : 'Save changes to model'
                  "
                  @click="saveChanges"
                >
                  <span v-if="saving" class="flex items-center">
                    <svg
                      class="animate-spin -ml-1 mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      />
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Saving...
                  </span>
                  <span v-else>Save Changes</span>
                </button>
                <button
                  class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  :disabled="saving"
                  @click="confirmDelete"
                >
                  {{ saving ? "Deleting..." : "Delete Model" }}
                </button>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Database Type</label>
                <select
                  v-model="model.dbType"
                  class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option
                    v-for="dbType in availableDBTypes"
                    :key="dbType.value"
                    :value="dbType.value"
                  >
                    {{ dbType.label }}
                  </option>
                </select>
              </div>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Target Language</label>
                  <select
                    v-model="model.language"
                    class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option
                      v-for="langType in availableLanguages"
                      :key="langType.value"
                      :value="langType.value"
                    >
                      {{ langType.label }}
                    </option>
                  </select>
                  <p class="mt-1 text-sm text-gray-500">
                    This will determine the data type mappings and available
                    templates
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tables Section -->
        <div class="space-y-6">
          <div
            v-for="(table, tableIndex) in model.tables"
            :key="tableIndex"
            class="border rounded-lg p-6"
          >
            <!-- Table Header -->
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Table Name</label>
                  <input
                    v-model="table.name"
                    class="w-full px-3 py-2 border rounded hover:border-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="Table Name"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Table Path (optional)</label>
                  <input
                    v-model="table.path"
                    class="w-full px-3 py-2 border rounded hover:border-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="Table Path"
                  >
                </div>
              </div>
              <div class="flex justify-end">
                <button
                  class="text-red-500 hover:text-red-700"
                  @click="removeTable(tableIndex)"
                >
                  Remove Table
                </button>
              </div>
            </div>

            <!-- Column Headers -->
            <div class="grid grid-cols-12 gap-4 mb-2 px-2">
              <div class="col-span-3 text-sm font-medium text-gray-700">
                Column Name
              </div>
              <div class="col-span-2 text-sm font-medium text-gray-700">
                Data Type
              </div>
              <div class="col-span-1 text-sm font-medium text-gray-700">
                Length
              </div>
              <div class="col-span-3 text-sm font-medium text-gray-700">
                Properties
              </div>
              <div class="col-span-2 text-sm font-medium text-gray-700">
                Default Value
              </div>
              <div class="col-span-1 text-sm font-medium text-gray-700">
                Actions
              </div>
            </div>

            <!-- Columns -->
            <div class="space-y-2">
              <div
                v-for="(column, columnIndex) in table.columns"
                :key="columnIndex"
                class="grid grid-cols-12 gap-4 items-center"
              >
                <!-- Column Name -->
                <input
                  v-model="column.name"
                  class="col-span-3 px-2 py-1 border rounded hover:border-gray-400 focus:border-blue-500 focus:outline-none"
                  placeholder="Column name"
                >

                <!-- Data Type -->
                <select
                  v-model="column.type"
                  class="col-span-2 px-2 py-1 border rounded hover:border-gray-400 focus:border-blue-500 focus:outline-none"
                  @change="handleTypeChange(column)"
                >
                  <optgroup
                    v-for="(types, category) in availableTypes"
                    :key="category"
                    :label="category"
                  >
                    <option
                      v-for="type in types"
                      :key="type.value"
                      :value="type.value"
                      :title="type.description"
                    >
                      {{ type.label }}
                    </option>
                  </optgroup>
                </select>

                <!-- Length (if applicable) -->
                <div class="col-span-1 relative group">
                  <input
                    v-if="showLengthFor(column.type)"
                    v-model="column.length"
                    type="number"
                    class="w-full px-2 py-1 border rounded hover:border-gray-400 focus:border-blue-500 focus:outline-none"
                    :placeholder="getDefaultLength(column.type)"
                  >
                  <div
                    v-if="showLengthFor(column.type)"
                    class="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 -top-8 left-0 w-48"
                  >
                    Recommended length for {{ column.type }}:
                    {{ getDefaultLength(column.type) }}
                  </div>
                </div>

                <!-- Checkboxes -->
                <div class="col-span-3 flex space-x-4">
                  <label class="flex items-center space-x-2">
                    <input
                      v-model="column.isPrimaryKey"
                      type="checkbox"
                      class="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      @change="handlePrimaryKeyChange(column)"
                    >
                    <span class="text-sm">Primary Key</span>
                  </label>

                  <label class="flex items-center space-x-2">
                    <input
                      v-model="column.isNullable"
                      type="checkbox"
                      :disabled="column.isPrimaryKey"
                      class="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      @change="handleNullableChange(column)"
                    >
                    <span class="text-sm">Nullable</span>
                  </label>
                </div>

                <!-- Default Value -->
                <input
                  v-if="!column.isNullable && !column.isPrimaryKey"
                  v-model="column.defaultValue"
                  class="col-span-2 px-2 py-1 border rounded hover:border-gray-400 focus:border-blue-500 focus:outline-none"
                  :placeholder="getDefaultValuePlaceholder(column.type)"
                >
                <div v-else class="col-span-2" />

                <!-- Remove Button -->
                <button
                  class="col-span-1 px-2 py-1 text-red-500 hover:text-red-700"
                  title="Remove Column"
                  @click="removeColumn(table, columnIndex)"
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

              <!-- Add Column Button -->
              <button
                class="mt-2 px-4 py-2 text-sm border rounded hover:bg-gray-50 w-full"
                @click="addColumn(table)"
              >
                Add Column
              </button>
            </div>
          </div>

          <button
            class="w-full px-4 py-2 border-2 border-dashed rounded-lg hover:bg-gray-50"
            @click="addTable"
          >
            Add Table
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useModelStore } from "../../stores/modelStore";
import { useToast } from "vue-toastification";
import {useDataTypeStore } from "../../stores/dataTypeStore";
import {
  getAvailableTypes,
  getDefaultValuePlaceholder,  
  getDefaultLength
} from "../../utils/columnUtils";


const dataTypeStore = useDataTypeStore();
const route = useRoute();
const router = useRouter();
const modelStore = useModelStore();
const toast = useToast();

const model = ref(null);
const loading = ref(true);
const saving = ref(false);
const error = ref(null);
const originalModel = ref(null);

// Validation
const validationErrors = computed(() => {
  const errors = [];

  if (!model.value?.name) {
    errors.push("Model name is required");
  }

  model.value?.tables.forEach((table, tableIndex) => {
    if (!table.name) {
      errors.push(`Table ${tableIndex + 1} requires a name`);
    }

    table.columns.forEach((column, columnIndex) => {
      if (!column.name) {
        errors.push(
          `Column ${columnIndex + 1} in table '${
            table.name || tableIndex + 1
          }' requires a name`
        );
      }
      if (column.isPrimaryKey && column.isNullable) {
        errors.push(
          `Primary key column '${column.name}' in table '${table.name}' cannot be nullable`
        );
      }
    });

    // Check if table has at least one column
    if (table.columns.length === 0) {
      errors.push(
        `Table '${table.name || tableIndex + 1}' must have at least one column`
      );
    }

    // Check if table has a primary key
    if (!table.columns.some((col) => col.isPrimaryKey)) {
      errors.push(
        `Table '${table.name || tableIndex + 1}' must have a primary key`
      );
    }
  });

  return errors;
});

const isValid = computed(() => validationErrors.value.length === 0);

// Table and Column Management
function addTable() {
  if (!model.value.tables) {
    model.value.tables = [];
  }

  model.value.tables.push({
    name: "",
    path: "",
    columns: [
      {
        name: "",
        type: "string",
        length: "1",
        isPrimaryKey: false,
        isNullable: true,
        defaultValue: null,
      },
    ],
  });
}

function removeTable(index) {
  if (confirm("Are you sure you want to remove this table?")) {
    model.value.tables.splice(index, 1);
  }
}

function addColumn(table) {
  table.columns.push({
    name: "",
    type: "string",
    length: "1",
    isPrimaryKey: false,
    isNullable: true,
    defaultValue: null,
  });
}

function removeColumn(table, columnIndex) {
  table.columns.splice(columnIndex, 1);
}

// Column Type Handling
function showLengthFor(type) {
  return [
    "string",
    "char",
    "nvarchar",
    "binary",
    "varbinary",
    "decimal",
  ].includes(type);
}

function handleTypeChange(column) {

  column.length = getDefaultLength(column.type);
  //DEFAULT_LENGTHS[column.type];
  // ... rest of type change handling (same as ManualEntry)
}

function handlePrimaryKeyChange(column) {
  if (column.isPrimaryKey) {
    column.isNullable = false;
    column.defaultValue = null;
  }
}

function handleNullableChange(column) {
  if (column.isNullable) {
    column.defaultValue = null;
  }
}

onMounted(async () => {
  dataTypeStore.initialize(); // init our dt store  
  await loadModel();
});

async function loadModel() {
  loading.value = true;
  error.value = null;

  try {
    // First ensure models are loaded
    await modelStore.loadModels();

    const loadedModel = await modelStore.getModelById(route.params.id);
    if (!loadedModel) {
      throw new Error("Model not found");
    }

    model.value = loadedModel;
    originalModel.value = JSON.parse(JSON.stringify(loadedModel));
  } catch (err) {
    console.error("Error loading model:", err);
    error.value = err.message;
    toast.error(err.message);
  } finally {
    loading.value = false;
  }
}

// Add export function
async function exportModel() {
  try {
    const modelData = JSON.stringify(model.value, null, 2);
    const blob = new Blob([modelData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${model.value.name
      .toLowerCase()
      .replace(/\s+/g, "-")}-model.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting model:", error);
    toast.error("Failed to export model");
  }
}

async function confirmDelete() {
  if (
    !confirm(
      "Are you sure you want to delete this model? This action cannot be undone."
    )
  ) {
    return;
  }

  saving.value = true;
  try {
    await modelStore.deleteModel(model.value.id);
    toast.success("Model deleted successfully");
    router.push({ name: "ModelDesigner" }); // or whatever your main models list route is named
  } catch (err) {
    console.error("Error deleting model:", err);
    toast.error(`Failed to delete model: ${err.message}`);
  } finally {
    saving.value = false;
  }
}

async function saveChanges() {
  if (!isValid.value) {
    // Show all validation errors
    validationErrors.value.forEach((error) => {
      toast.error(error);
    });
    return;
  }

  saving.value = true;
  try {
    await modelStore.updateModel(model.value);
    toast.success("Model saved successfully!");
  } catch (error) {
    toast.error(`Failed to save model: ${error.message}`);
  } finally {
    saving.value = false;
  }
}

// Add computed property for data types
const availableTypes = computed(() => {
  const types = getAvailableTypes();
  // Group types by category
  const groupedTypes = Object.entries(types).reduce((acc, [key, type]) => {
    const category = type.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({
      value: key,
      label: type.label,
      description: type.description
    });
    return acc;
  }, {});

  return groupedTypes || {};
});
const availableDBTypes = computed(() => useDataTypeStore().getSupportedDatabases() || []);
const availableLanguages = computed(() => useDataTypeStore().getSupportedLanguages() || []);
</script>
