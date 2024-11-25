<template>
  <div class="space-y-4">
    <div
      class="border-2 border-dashed p-4 rounded"
      :class="{
        'border-blue-500 bg-blue-50': isDragging,
        'border-gray-300': !isDragging,
      }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <input
        type="file"
        accept=".sql"
        @change="handleFileUpload"
        class="hidden"
        ref="fileInput"
      />
      <div @click="$refs.fileInput.click()" class="text-center cursor-pointer">
        <p>Drop your SQL file here or click to browse</p>
        <p class="text-sm text-gray-500">
          Supports CREATE TABLE statements ONLY!
        </p>
      </div>
    </div>

    <div v-if="sqlContent" class="space-y-4">
      <div class="bg-gray-50 p-4 rounded">
        <div class="flex justify-between items-center mb-2">
          <h3 class="font-semibold">SQL Content:</h3>
          <button
            @click="showFullSQL = !showFullSQL"
            class="text-sm text-blue-600 hover:text-blue-800"
          >
            {{ showFullSQL ? "Show Preview" : "Show Full SQL" }}
          </button>
        </div>
        <pre
          class="text-sm overflow-auto"
          :class="{ 'max-h-60': !showFullSQL }"
          >{{ showFullSQL ? sqlContent : sqlPreview }}</pre
        >
      </div>

      <div
        v-if="error"
        class="bg-red-50 border border-red-200 text-red-700 p-4 rounded"
      >
        {{ error }}
      </div>

      <div
        v-if="parsedTables.length"
        class="bg-green-50 border border-green-200 text-green-700 p-4 rounded"
      >
        Successfully parsed {{ parsedTables.length }} tables:
        <ul class="list-disc list-inside mt-2">
          <li v-for="table in parsedTables" :key="table.name">
            {{ table.name }} ({{ table.columns.length }} columns)
          </li>
        </ul>
      </div>

      <button
        @click="parseSQL"
        class="px-4 py-2 rounded"
        :class="{
          'bg-blue-500 hover:bg-blue-600 text-white': !parsing,
          'bg-gray-400 cursor-not-allowed text-white': parsing,
        }"
        :disabled="parsing"
      >
        <span v-if="parsing" class="flex items-center">
          <svg
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Parsing SQL...
        </span>
        <span v-else>Parse SQL</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  parseSQLToTables,
  validateParsedTables,
} from "../../../utils/sqlParser";

const emit = defineEmits(["tables-loaded", "parsing-status"]);
const fileInput = ref(null);
const sqlContent = ref("");
const isDragging = ref(false);
const error = ref("");
const parsing = ref(false);
const parsedTables = ref([]);
const showFullSQL = ref(false);

const sqlPreview = computed(() => {
  if (!sqlContent.value) return "";
  return sqlContent.value.slice(0, 200) + "...";
});

function handleDrop(event) {
  isDragging.value = false;
  const file = event.dataTransfer.files[0];
  if (file && file.name.toLowerCase().endsWith(".sql")) {
    //log("File dropped:", file.name, "Size:", file.size, "bytes");
    readFile(file);
  } else {
    error.value = "Please drop a SQL file";
  }
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    //log("File selected:", file.name, "Size:", file.size, "bytes");
    readFile(file);
  }
}

function readFile(file) {
  const reader = new FileReader();

  reader.onload = (e) => {
    sqlContent.value = e.target.result;
    //log("Full SQL content:", sqlContent.value);
  };

  reader.onerror = (e) => {
    console.error("Error reading file:", e);
    error.value = "Failed to read SQL file";
  };

  reader.readAsText(file);
}

async function parseSQL() {
  error.value = "";
  parsing.value = true;
  emit("parsing-status", true);

  try {
    if (!sqlContent.value.trim()) {
      throw new Error("No SQL content provided");
    }

    console.log(
      "Attempting to parse SQL content length:",
      sqlContent.value.length
    );
    const tables = parseSQLToTables(sqlContent.value);

    // Validate the parsed tables
    const validationErrors = validateParsedTables(tables);
    if (validationErrors.length) {
      throw new Error("Validation errors:\n" + validationErrors.join("\n"));
    }

    //log("Parsed tables:", JSON.stringify(tables, null, 2));
    parsedTables.value = tables;
    emit("tables-loaded", tables);
    emit("parsing-status", false);
  } catch (err) {
    console.error("Error parsing SQL:", err);
    error.value = err.message;
    emit("parsing-status", false, err.message);
  } finally {
    parsing.value = false;
  }
}
</script>

<style scoped>
.border-dashed {
  transition: all 0.2s ease;
}

.max-h-60 {
  max-height: 15rem;
}
</style>
