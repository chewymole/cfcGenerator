<template>
  <div class="space-y-4">
    <div
      class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
    >
      <input
        ref="fileInput"
        type="file"
        class="hidden"
        accept=".json"
        @change="handleFileImport"
      >
      <button
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        :disabled="importing"
        @click="$refs.fileInput.click()"
      >
        {{ importing ? "Importing..." : "Select Model File" }}
      </button>
      <p class="mt-2 text-sm text-gray-600">
        Select a previously exported model file (.json)
      </p>
    </div>

    <div v-if="error" class="text-red-500 text-sm">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useModelStore } from "../../../stores/modelStore";

const emit = defineEmits(["tables-loaded"]);
const modelStore = useModelStore();
const fileInput = ref(null);
const importing = ref(false);
const error = ref(null);

async function handleFileImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  importing.value = true;
  error.value = null;

  try {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const modelData = JSON.parse(e.target.result);
        // Emit the tables from the imported model
        emit("tables-loaded", modelData.tables || []);
      } catch (err) {
        error.value = `Failed to parse model file: ${err.message}`;
      }
    };
    reader.readAsText(file);
  } catch (err) {
    error.value = `Error reading file: ${err.message}`;
  } finally {
    importing.value = false;
  }
}
</script>
