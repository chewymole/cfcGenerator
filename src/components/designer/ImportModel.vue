<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-6">Import Model</h2>

    <!-- Import Options -->
    <div class="mb-6">
      <div class="flex space-x-4 mb-4">
        <button
          v-for="option in importOptions"
          :key="option.id"
          @click="selectedOption = option.id"
          class="px-4 py-2 border rounded"
          :class="{ 'bg-blue-500 text-white': selectedOption === option.id }"
        >
          {{ option.name }}
        </button>
      </div>

      <!-- SQL File Import -->
      <div v-if="selectedOption === 'sql'" class="space-y-4">
        <div class="border-2 border-dashed p-4 rounded">
          <input
            type="file"
            accept=".sql"
            @change="handleFileUpload"
            class="hidden"
            ref="fileInput"
          />
          <div
            @click="$refs.fileInput.click()"
            class="text-center cursor-pointer"
          >
            <p>Drop your SQL file here or click to browse</p>
            <p class="text-sm text-gray-500">
              Supports CREATE TABLE statements
            </p>
          </div>
        </div>
        <div v-if="sqlContent" class="bg-gray-50 p-4 rounded">
          <pre class="text-sm">{{ sqlPreview }}</pre>
        </div>
      </div>

      <!-- JSON/XML Import -->
      <div v-if="selectedOption === 'json'" class="space-y-4">
        <textarea
          v-model="jsonContent"
          class="w-full h-48 p-2 border rounded"
          placeholder="Paste your JSON model definition here..."
        ></textarea>
      </div>
    </div>

    <!-- Preview -->
    <div v-if="parsedTables.length" class="mb-6">
      <h3 class="text-lg font-semibold mb-4">Detected Tables</h3>
      <div class="grid grid-cols-2 gap-4">
        <div
          v-for="table in parsedTables"
          :key="table.name"
          class="border rounded p-4"
        >
          <h4 class="font-semibold mb-2">{{ table.name }}</h4>
          <div class="text-sm">
            <div
              v-for="column in table.columns"
              :key="column.name"
              class="flex justify-between py-1"
            >
              <span>{{ column.name }}</span>
              <span class="text-gray-500">{{ column.type }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-between">
      <button
        @click="$router.push({ name: 'ModelDesigner' })"
        class="px-4 py-2 border rounded"
      >
        Cancel
      </button>
      <button
        @click="importTables"
        class="px-4 py-2 bg-blue-500 text-white rounded"
        :disabled="!canImport"
      >
        Import Tables
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useModelStore } from "../../stores/modelStore";

const router = useRouter();
const modelStore = useModelStore();

const importOptions = [
  { id: "sql", name: "SQL File" },
  { id: "json", name: "JSON/XML" },
];

const selectedOption = ref("sql");
const sqlContent = ref("");
const jsonContent = ref("");
const parsedTables = ref([]);
const fileInput = ref(null);

const sqlPreview = computed(() => {
  if (!sqlContent.value) return "";
  return sqlContent.value.slice(0, 200) + "...";
});

const canImport = computed(() => {
  return parsedTables.value.length > 0;
});

async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      sqlContent.value = e.target.result;
      try {
        parsedTables.value = await modelStore.parseSQLTables(sqlContent.value);
      } catch (error) {
        console.error("Error parsing SQL:", error);
        // Handle error
      }
    };
    reader.readAsText(file);
  }
}

async function importTables() {
  try {
    await modelStore.saveTableDefinitions(parsedTables.value);
    router.push({
      name: "NewModel",
      query: { source: "import" },
    });
  } catch (error) {
    console.error("Error importing tables:", error);
    // Handle error
  }
}
</script>
