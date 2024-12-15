<template>
  <div class="p-6">
    <div class="max-w-7xl mx-auto">
      <div class="mb-6">
        <h2 class="text-lg font-medium text-gray-900">
          Generate Code
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          Using template: {{ store.getSelectedTemplate()?.name }}
        </p>
        <button
          class="ml-2 text-sm text-blue-600 hover:text-blue-800"
          @click="isTemplateModalOpen = true"
        >
          View Template
        </button>
      </div>

      <div class="space-y-4">
        <!-- Selected Tables -->
        <div class="bg-white rounded-lg shadow p-4">
          <h3 class="text-md font-medium mb-2">
            Selected Tables
          </h3>
          <div class="space-y-2">
            <div
              v-for="table in selectedTables"
              :key="typeof table === 'string' ? table : table.name"
              class="text-sm text-gray-600"
            >
              {{ table }}
            </div>
          </div>
        </div>

        <!-- Generate Button -->
        <button
          class="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          :disabled="loading"
          @click="generateCode"
        >
          {{ loading ? "Generating..." : "Generate Code" }}
        </button>

        <!-- Error Display -->
        <div v-if="error" class="text-red-600 text-sm">
          {{ error }}
        </div>
      </div>
    </div>
  </div>

  <Modal
    v-if="isTemplateModalOpen"
    :show="isTemplateModalOpen"
    title="Template Details"
    @close="isTemplateModalOpen = false"
  >
    <div class="space-y-4">
      <div>
        <span class="font-medium">Name:</span>
        {{ store.getSelectedTemplate()?.name }}
      </div>
      <div>
        <span class="font-medium">Description:</span>
        {{ store.getSelectedTemplate()?.description }}
      </div>
      <div>
        <span class="font-medium">Code:</span>
        <pre
          class="text-sm text-gray-600 overflow-x-auto p-2 bg-gray-50 rounded"
        >
          Content coming soon
        </pre>
      </div>
    </div>
  </Modal>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useGeneratorStore } from "../stores/generatorStore";
import { log, error as logError } from "../utils/logger";
import { generateCode as generateCodeService } from "../services/codeGenerator";
import { convertModelToXML } from "../utils/modelConverter";
import Modal from "./common/Modal.vue";

const store = useGeneratorStore();
const router = useRouter();
const selectedTemplate = computed(() => store.selectedTemplate);
const selectedTables = computed(() => {
  const tables = store.getSelectedTables();
  // Ensure we always return the table names consistently
  return tables.map((table) =>
    typeof table === "string" ? table : table.name
  );
});
const tablesXML = computed(() => store.tablesXML);
const generatedCode = ref("");
const error = ref("");
const loading = ref(false);

const isTemplateModalOpen = ref(false);

async function generateCode() {
  loading.value = true;
  error.value = "";

  try {
    // Check if we're working with a model or tables
    let xmlData = tablesXML.value;

    if (store.selectedModel) {
      log("Selected Model:", store.selectedModel); // Debug log
      xmlData = convertModelToXML(store.selectedModel);
    }

    log("XML Data:", xmlData); // Debug log

    if (!xmlData) {
      throw new Error(
        "No data available. Please ensure a model or tables are selected."
      );
    }

    log("Generating code with:", {
      template: selectedTemplate.value,
      tables: selectedTables.value,
      tablesXML: xmlData,
    });

    const code = await generateCodeService(
      selectedTemplate.value,
      selectedTables.value,
      xmlData
    );

    if (code) {
      router.push({ name: "ViewCode" });
    } else {
      throw new Error("Generated code is empty or only whitespace");
    }
  } catch (err) {
    logError("Error generating code:", err);
    error.value = `Error generating code: ${err.message}`;
    generatedCode.value = "";
    error.value = "Error generating code: " + err.message;
  } finally {
    loading.value = false;
  }
}
</script>
