<template>
  <div class="view-code">
    <div
      class="menu-bar flex justify-between items-center mb-4 bg-gray-100 p-4"
    >
      <div class="flex justify-between items-center mb-4" style="width: 80%;">
        <h2 class="text-lg font-semibold">Code Editor</h2>
        <div v-if="selectedTemplate" class="text-center">
          <h3 class="text-center">{{ selectedTemplate.displayName }}</h3>
          <span class="text-sm text-gray-600 ml-2">
            ({{ selectedTemplate.style }} based)
          </span>
          <p class="text-sm text-gray-600">
            {{ selectedTemplate.description }}
          </p>
        </div>
        <div></div>
        <!-- Empty div to balance the flex layout -->
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
      <div class="w-1/4 pr-4 border-r h-[calc(100vh-200px)] overflow-y-auto">
        <h3 class="text-md font-semibold mb-2">Tables</h3>
        <ul class="space-y-2">
          <li
            v-for="file in generatedFiles"
            :key="file.tableName"
            @click="selectTable(file.tableName)"
            class="cursor-pointer p-2 rounded hover:bg-gray-100"
            :class="{ 'bg-blue-100': selectedTable === file.tableName }"
          >
            {{ file.tableName }}
          </li>
        </ul>
      </div>
      <div class="w-3/4 pl-4">
        <div v-if="selectedTable">
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

          <Editor
            v-if="isValidContent"
            :key="selectedTable"
            :fileContent="currentFileContent"
            :fileName="currentFileName"
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
const generatedFiles = computed(() => store.generatedCodeFiles);
const selectedTemplate = computed(() => store.selectedTemplate);
const selectedTable = ref("");
const fileExtension = computed(() => selectedTemplate.value?.type || "cfc");

const isValidContent = computed(() => {
  const selectedFile = generatedFiles.value.find(
    (file) => file.tableName === selectedTable.value
  );
  return (
    selectedFile?.success &&
    selectedFile.code &&
    selectedFile.code.trim().length > 0
  );
});

const errorMessage = computed(() => {
  const selectedFile = generatedFiles.value.find(
    (file) => file.tableName === selectedTable.value
  );
  return selectedFile?.error || "Template generation failed";
});

const currentFileContent = computed(() => {
  const selectedFile = generatedFiles.value.find(
    (file) => file.tableName === selectedTable.value
  );
  return selectedFile ? selectedFile.code : "";
});

const currentFileName = computed(() => {
  return `${selectedTable.value}.${fileExtension.value}`;
});

watch(
  generatedFiles,
  (newFiles) => {
    if (newFiles.length > 0 && !selectedTable.value) {
      selectTable(newFiles[0].tableName);
    }
  },
  { immediate: true }
);

function selectTable(tableName) {
  log("Selecting table:", tableName);
  selectedTable.value = tableName;
}

function saveCurrentFile() {
  const file = generatedFiles.value.find(
    (f) => f.tableName === selectedTable.value
  );
  if (file) {
    log("Saving file:", file.tableName, file.code);
    const blob = new Blob([file.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const fileExtension = selectedTemplate.value?.type || "cfc";
    a.download = `${file.tableName}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

function storeChanges(view) {
  log("-----Storing changes:", view);
  store.setGeneratedCodeFile(view.fileName, view.code);
  log("-----Updated file:", generatedFiles.value);
}

function saveAll() {
  log("Saving all files");
  generatedFiles.value.forEach((file) => {
    const blob = new Blob([file.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const fileExtension = selectedTemplate.value?.type || "cfc";
    a.download = `${file.tableName}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}
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
