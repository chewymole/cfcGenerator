<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-blue-600 text-white p-4">
      <h1 class="text-2xl font-bold">Illudium PU-36 Code Generator</h1>
    </header>
    <main class="p-4">
      <div v-if="loading" class="text-center py-4">
        <p class="text-gray-600">Loading...</p>
      </div>
      <div
        v-if="error"
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong class="font-bold">Error!</strong>
        <span class="block sm:inline">{{ error }}</span>
      </div>
      <DataSourceInput
        v-if="step === 1"
        @datasource-submitted="handleDataSourceSubmission"
      />
      <TableSelector
        v-if="step === 2"
        :tables="tables"
        @tables-selected="handleTableSelection"
      />
      <TemplateSelector
        v-if="step === 3"
        :templates="templates"
        @template-selected="handleTemplateSelection"
      />
      <CodeGenerator
        v-if="step === 4"
        :selectedTables="selectedTables"
        :selectedTemplate="selectedTemplate"
        @generation-complete="handleGenerationComplete"
      />
      <GeneratedCodeViewer
        v-if="step === 5"
        :generatedFiles="generatedFiles"
        @save-files="handleSaveFiles"
      />
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import DataSourceInput from "./DataSourceInput.vue";
import TableSelector from "./TableSelector.vue";
import TemplateSelector from "./TemplateSelector.vue";
import CodeGenerator from "./CodeGenerator.vue";
import GeneratedCodeViewer from "./GeneratedCodeViewer.vue";

const step = ref(1);
const dataSource = ref("");
const tables = ref([]);
const templates = ref([]);
const selectedTables = ref([]);
const selectedTemplate = ref(null);
const generatedFiles = ref([]);
const loading = ref(false);
const error = ref(null);

function handleDataSourceSubmission(submittedDataSource) {
  dataSource.value = submittedDataSource;
  // TODO: Implement API call to get tables for the submitted data source
  // For now, we'll mock this:
  tables.value = ["Table1", "Table2", "Table3"];
  step.value = 2;
}

function handleTableSelection(selectedTables) {
  // TODO: Implement API call to get available templates
  // For now, we'll mock this:
  templates.value = ["Template1", "Template2", "Template3"];
  selectedTables.value = selectedTables;
  step.value = 3;
}

function handleTemplateSelection(template) {
  selectedTemplate.value = template;
  step.value = 4;
}

function handleGenerationComplete(files) {
  generatedFiles.value = files;
  step.value = 5;
}

function handleSaveFiles(files) {
  // TODO: Implement file saving logic
  console.log("Saving files:", files);
}
</script>
