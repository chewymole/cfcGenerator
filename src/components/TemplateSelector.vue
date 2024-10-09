<template>
  <div class="flex">
    <!-- Language filter column -->
    <div class="w-1/4 pr-4">
      <h3 class="text-lg font-semibold mb-2">Filter by Language</h3>
      <div v-for="lang in uniqueLanguages" :key="lang" class="mb-2">
        <label
          class="flex items-center"
          @click="toggleLanguage(lang)"
          :class="{ 'opacity-50': !selectedLanguages.includes(lang) }"
        >
          <img
            :src="`/icons/file_type_${lang.toLowerCase()}.svg`"
            :alt="`${lang} icon`"
            class="w-5 h-5 mr-2"
          />
          {{ lang }}
        </label>
      </div>
    </div>

    <!-- Templates column -->
    <div class="w-3/4">
      <h2 class="text-xl font-semibold mb-4">Select a Template</h2>
      <div v-if="loading" class="text-gray-600">Loading templates...</div>
      <div v-else-if="error" class="text-red-600">{{ error }}</div>
      <div v-else-if="filteredTemplates.length === 0" class="text-gray-600">
        No templates available.
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div
          v-for="template in filteredTemplates"
          :key="template.name"
          class="border rounded p-4 cursor-pointer hover:bg-gray-100"
          :class="{ 'bg-blue-100': selectedTemplate === template }"
          @click="selectTemplate(template)"
        >
          <h3 class="font-bold">{{ template.displayName }}</h3>
          <p>
            {{ template.style }} based {{ template.language }} ({{
              template.fileType
            }})
          </p>
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useGeneratorStore } from "../stores/generatorStore";
import { getAvailableTemplates } from "../services/templateService";
import { log, error as logError } from "../utils/logger";

const router = useRouter();
const store = useGeneratorStore();
const templates = ref([]);
const selectedTemplate = ref(null);
const loading = ref(true);
const error = ref("");
const selectedLanguages = ref([]);

const uniqueLanguages = computed(() => {
  return [...new Set(templates.value.map((t) => t.type))];
});

const filteredTemplates = computed(() => {
  if (selectedLanguages.value.length === 0) {
    return templates.value;
  }
  return templates.value.filter((t) =>
    selectedLanguages.value.includes(t.type)
  );
});

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

function toggleLanguage(lang) {
  const index = selectedLanguages.value.indexOf(lang);
  if (index === -1) {
    selectedLanguages.value.push(lang);
  } else {
    selectedLanguages.value.splice(index, 1);
  }
}

function selectTemplate(template) {
  selectedTemplate.value = template;
  store.setSelectedTemplate(template);

  log("Selected template:", template);

  try {
    store.setWrapperFile(template.name);
    store.setIncludes(template.includes);
    log(
      `Template ${template.displayName} selected with wrapper:`,
      template.name,
      "and includes:",
      template.includes
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
