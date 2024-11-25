<template>
  <div class="view-code">
    <!-- Menu Bar -->
    <div
      class="menu-bar flex justify-between items-center mb-4 bg-gray-100 p-4"
    >
      <div class="flex justify-between items-center mb-4" style="width: 80%;">
        <h2 class="text-lg font-semibold">Code Editor</h2>
        <div v-if="selectedTemplate" class="text-center">
          <h3 class="text-center">{{ selectedTemplate.name }}</h3>
          <span class="text-sm text-gray-600 ml-2">
            ({{ selectedTemplate.style }} based)
          </span>
          <p class="text-sm text-gray-600">
            {{ selectedTemplate.description }}
          </p>
        </div>
        <div></div>
      </div>
      <div>
        <button
          class="bg-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200 mr-2"
          @click="saveCurrentFile"
        >
          <i class="fas fa-save mr-2"></i>
          Save
        </button>
        <button
          class="bg-green-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-600 transition duration-200"
          @click="saveAll"
        >
          <i class="fas fa-save mr-2"></i>
          Save All
        </button>
      </div>
    </div>

    <div class="flex">
      <!-- Left Sidebar - Tables and Files -->
      <div class="w-1/4 pr-4 border-r h-[calc(100vh-200px)] overflow-y-auto">
        <h3 class="text-md font-semibold mb-2">Generated Files</h3>
        <div class="space-y-4">
          <div v-for="table in tables" :key="table.name" class="space-y-2">
            <!-- Table Header -->
            <div
              class="flex items-center justify-between p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
              @click="toggleTable(table.name)"
            >
              <span class="font-medium">{{ table.name }}</span>
              <svg
                class="w-4 h-4 transform transition-transform duration-200"
                :class="{ 'rotate-90': expandedTables[table.name] }"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>

            <!-- Files List -->
            <div v-if="expandedTables[table.name]" class="ml-4 space-y-1">
              <!-- Main template file -->
              <div
                @click="selectFile(table.name, `${table.name}-main`)"
                class="cursor-pointer p-2 rounded text-sm hover:bg-gray-100"
                :class="{
                  'bg-blue-100': isSelectedFile(
                    table.name,
                    `${table.name}-main`
                  ),
                }"
              >
                {{ getDisplayName(table.name, "main") }}
              </div>
              <!-- Child template files (if any) -->
              <div
                v-for="childFile in getChildFiles(table.name)"
                :key="childFile.id"
                @click="selectFile(table.name, childFile.id)"
                class="cursor-pointer p-2 rounded text-sm hover:bg-gray-100 ml-2"
                :class="{
                  'bg-blue-100': isSelectedFile(table.name, childFile.id),
                }"
              >
                {{ childFile.name }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Content - Editor -->
      <div class="w-3/4 pl-4">
        <div v-if="selectedFile">
          <!-- Error Message -->
          <div
            v-if="!isValidContent"
            class="p-4 bg-red-50 border border-red-200 rounded mb-4"
          >
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg
                  class="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  Template Generation Failed
                </h3>
                <div class="mt-2 text-sm text-red-700">
                  <p>{{ errorMessage }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Filename Input -->
          <div class="mb-4">
            <input
              v-model="currentFileName"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter filename"
            />
          </div>

          <!-- Editor -->
          <Editor
            v-if="isValidContent"
            :key="`${selectedFile.tableName}-${selectedFile.id}`"
            :fileContent="selectedFile.code"
            :fileName="selectedFile.filename"
            @update:file-content="storeChanges"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useGeneratorStore } from "../stores/generatorStore";
import Editor from "./Editor.vue";
import { log } from "../utils/logger";

const store = useGeneratorStore();
const selectedTemplate = computed(() => store.getSelectedTemplate());
const expandedTables = ref({});
const selectedTableName = ref("");
const selectedFileId = ref(null);
const currentFileName = ref("");

// Computed properties for the nested structure
const tables = computed(() => {
  const files = store.generatedCodeFiles;
  const tableMap = new Map();

  files.forEach((file) => {
    const tableName =
      typeof file.tableName === "object" ? file.tableName.name : file.tableName;

    if (!tableMap.has(tableName)) {
      tableMap.set(tableName, {
        name: tableName,
        files: [
          {
            id: `${tableName}-main`,
            type: "main",
            name:
              file.filename ||
              `${tableName}.${store.getSelectedTemplate()?.filetype || "cfc"}`,
            code: file.code,
            success: file.success,
            error: file.error,
          },
        ],
      });

      // Get child files from store
      const childFiles = store.getChildFiles(tableName);
      if (childFiles && Object.keys(childFiles).length > 0) {
        Object.entries(childFiles).forEach(([templateId, childFile]) => {
          tableMap.get(tableName).files.push({
            id: `${tableName}-${templateId}`,
            type: "child",
            templateId: templateId,
            name: childFile.filename,
            code: childFile.code,
            success: true,
            error: null,
          });
        });
      }
    }
  });

  return Array.from(tableMap.values());
});

const selectedFile = computed(() => {
  if (!selectedTableName.value || !selectedFileId.value) return null;
  return getFilesForTable(selectedTableName.value).find(
    (file) => file.id === selectedFileId.value
  );
});

const isValidContent = computed(() => {
  return (
    selectedFile.value?.success && selectedFile.value?.code?.trim().length > 0
  );
});

const errorMessage = computed(() => {
  return selectedFile.value?.error || "Template generation failed";
});

// Methods
function toggleTable(tableName) {
  expandedTables.value[tableName] = !expandedTables.value[tableName];
}

function getFilesForTable(tableName) {
  const name = typeof tableName === "object" ? tableName.name : tableName;
  return tables.value.find((t) => t.name === name)?.files || [];
}

function isSelectedFile(tableName, fileId) {
  const name = typeof tableName === "object" ? tableName.name : tableName;
  return selectedTableName.value === name && selectedFileId.value === fileId;
}

function selectFile(tableName, fileId) {
  const name = typeof tableName === "object" ? tableName.name : tableName;
  selectedTableName.value = name;
  selectedFileId.value = fileId;

  const file = getFilesForTable(name).find((f) => f.id === fileId);
  if (file) {
    currentFileName.value = file.name;
  }
}

function storeChanges(view) {
  if (!selectedFile.value) return;

  const file = {
    tableName: selectedTableName.value,
    code: view.code,
    filename: currentFileName.value,
    type: selectedFile.value.type,
  };

  if (selectedFile.value.type === "main") {
    store.setGeneratedCodeFile(file.tableName, file.code, file.filename);
  } else {
    store.setGeneratedChildFile(
      file.tableName,
      selectedFile.value.templateId,
      file.code,
      file.filename
    );
  }

  log("Updated file:", file);
}

function saveCurrentFile() {
  if (!selectedFile.value) return;

  const blob = new Blob([selectedFile.value.code], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = currentFileName.value;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function saveAll() {
  tables.value.forEach((table) => {
    table.files.forEach((file) => {
      const blob = new Blob([file.code], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  });
}

function getDisplayName(tableName, fileId) {
  const name = typeof tableName === "object" ? tableName.name : tableName;
  const file = getFilesForTable(name).find(
    (f) => f.id === fileId || f.type === fileId
  );
  if (file) {
    return file.name;
  }

  const template = store.getSelectedTemplate();
  return `${name}.${template?.filetype || "cfc"}`;
}

function getChildFiles(tableName) {
  const name = typeof tableName === "object" ? tableName.name : tableName;
  const table = tables.value.find((t) => t.name === name);
  return table?.files.filter((f) => f.type === "child") || [];
}

// Initialize first table and file
watch(
  tables,
  (newTables) => {
    if (newTables.length > 0 && !selectedTableName.value) {
      const firstTable = newTables[0];
      expandedTables.value[firstTable.name] = true;
      if (firstTable.files.length > 0) {
        selectFile(firstTable.name, firstTable.files[0].id);
      }
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #edf2f7;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #edf2f7;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 4px;
  border: 2px solid #edf2f7;
}
</style>
