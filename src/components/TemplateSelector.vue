<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Select a Template</h2>
    <div v-if="loading" class="text-gray-600">Loading templates...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>
    <div v-else-if="templates.length === 0" class="text-gray-600">
      No templates available.
    </div>
    <div v-else>
      <select
        v-model="selectedTemplate"
        @change="selectTemplate"
        class="w-full p-2 border rounded"
      >
        <option value="">Select a template</option>
        <option v-for="template in templates" :key="template" :value="template">
          {{ template.displayName }}: {{ template.style }} based format.
          {{ template.description }}
        </option>
      </select>
      <button
        @click="submitSelection"
        class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Continue
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useGeneratorStore } from "../stores/generatorStore";
import { getAvailableTemplates } from "../services/templateService";

const router = useRouter();
const store = useGeneratorStore();
const templates = ref([]);
const selectedTemplate = ref("");
const loading = ref(true);
const error = ref("");

onMounted(async () => {
  try {
    templates.value = await getAvailableTemplates();
    console.log("Templates loaded:", templates.value);
  } catch (err) {
    console.error("Error fetching templates:", err);
    error.value = "Failed to fetch templates. Please try again.";
  } finally {
    loading.value = false;
  }
});

async function selectTemplate() {
  store.setSelectedTemplate(selectedTemplate.value);

  console.log("Selected template:", selectedTemplate.value);

  try {
    const templateFiles = selectedTemplate.value;
    console.log("files", templateFiles);

    const wrapperFile = templateFiles.name + ".xsl";
    const includeFiles = templateFiles.includes;

    if (!wrapperFile) {
      throw new Error(
        `Wrapper XSL file not found for template: ${selectedTemplate.value.displayName}`
      );
    }

    store.setWrapperFile(wrapperFile);
    store.setIncludes(includeFiles);
    console.log(
      `Template ${selectedTemplate.value.displayName} selected with wrapper:`,
      wrapperFile,
      "and includes:",
      includeFiles
    );
  } catch (err) {
    console.error("Error processing template selection:", err);
    error.value = `Failed to process template selection for ${selectedTemplate.value.displayName}. Please try again.`;
  }
}

function submitSelection() {
  if (selectedTemplate.value.displayName) {
    console.log("Submitting template:", selectedTemplate.value.displayName);
    router.push({ name: "Generate" });
  } else {
    error.value = "Please select a template.";
  }
}
</script>
