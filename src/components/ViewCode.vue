<template>
  <div class="view-code">
    <div
      class="menu-bar flex justify-between items-center mb-4 bg-gray-100 p-4"
    >
      <h2 class="text-lg font-semibold">Code Editor</h2>
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
      <div class="w-1/4 pr-4 border-r">
        <h3 class="text-md font-semibold mb-2">Tables</h3>
        <ul class="space-y-2">
          <li
            v-for="file in generatedFiles"
            :key="file.tableName"
            @click="selectTable(file.tableName)"
            class="cursor-pointer p-2 rounded"
            :class="{ 'bg-blue-100': selectedTable === file.tableName }"
          >
            {{ file.tableName }}
          </li>
        </ul>
      </div>
      <div class="w-3/4 pl-4">
        <div v-if="selectedTable && currentFileContent">
          <Editor
            :key="selectedTable"
            :fileContent="currentFileContent"
            :fileName="selectedTable"
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
const currentFileContent = computed(() => {
  const selectedFile = generatedFiles.value.find(
    (file) => file.tableName === selectedTable.value
  );
  return selectedFile ? selectedFile.code : "";
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
    a.download = `${file.tableName}.cfc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

function storeChanges(view) {
  log("Storing changes:", view);
  const fileIndex = generatedFiles.value.findIndex(
    (file) => file.tableName === view.name
  );
  if (fileIndex !== -1) {
    store.setGeneratedCode(view.name, view.content);
  }
  log("Updated files:", generatedFiles.value);
}

function saveAll() {
  log("Saving all files");
  generatedFiles.value.forEach((file) => {
    const blob = new Blob([file.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file.tableName}.cfc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}
</script>

<style scoped>
.view-code {
  /* Add any additional styling here */
}
</style>
