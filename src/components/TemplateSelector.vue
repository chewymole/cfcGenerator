<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Select a Template</h2>
    <div v-if="loading" class="text-gray-600">Loading templates...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>
    <div v-else-if="templates.length === 0" class="text-gray-600">
      No templates available.
    </div>
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      <div
        v-for="template in templates"
        :key="template.name"
        class="border rounded p-4 cursor-pointer hover:bg-gray-100"
        :class="{ 'bg-blue-100': selectedTemplate === template }"
        @click="selectTemplate(template)"
      >
        <h3 class="font-bold">{{ template.displayName }}</h3>
        <p>{{ template.style }} based format</p>
        <p class="text-sm text-gray-600">{{ template.description }}</p>
      </div>
    </div>
    <button
      @click="submitSelection"
      class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      :disabled="!selectedTemplate"
    >
      Continue
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useGeneratorStore } from "../stores/generatorStore";
import { getAvailableTemplates } from "../services/templateService";
import { log, error as logError } from "../utils/logger";

const router = useRouter();
const store = useGeneratorStore();
const templates = ref([]);
const selectedTemplate = ref("");
const loading = ref(true);
const error = ref("");

onMounted(async () => {
  try {
    templates.value = await getAvailableTemplates();
    log("Templates loaded:", templates.value);
  } catch (err) {
    logError("Error fetching templates:", err);
    error.value = "Failed to fetch templates. Please try again.";
  } finally {
    loading.value = false;
  }
});

function selectTemplate(template) {
  selectedTemplate.value = template;
  store.setSelectedTemplate(template);

  log("Selected template:", template);

  try {
    const wrapperFile = template.name + ".xsl";
    const includeFiles = template.includes;

    if (!wrapperFile) {
      throw new Error(
        `Wrapper XSL file not found for template: ${template.displayName}`
      );
    }

    store.setWrapperFile(wrapperFile);
    store.setIncludes(includeFiles);
    log(
      `Template ${template.displayName} selected with wrapper:`,
      wrapperFile,
      "and includes:",
      includeFiles
    );
  } catch (err) {
    logError("Error processing template selection:", err);
    error.value = `Failed to process template selection for ${template.displayName}. Please try again.`;
  }
}

function submitSelection() {
  if (selectedTemplate.value) {
    log("Submitting template:", selectedTemplate.value.displayName);
    router.push({ name: "Generate" });
  } else {
    error.value = "Please select a template.";
  }
}
</script>
