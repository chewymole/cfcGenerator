<template>
  <div class="flex">
    <!-- Filter column -->
    <div class="w-1/4 pr-4">
      <h3 class="text-lg font-semibold mb-2">Filters</h3>

      <!-- Language filter
      <div class="mb-4">
        <h4 class="font-medium mb-1">Language</h4>
        <div v-for="lang in uniqueLanguages" :key="lang" class="mb-1">
          <label
            class="flex items-center cursor-pointer"
            @click="toggleFilter('language', lang)"
          >
            <img
              :src="`/icons/file_type_${lang.toLowerCase()}.svg`"
              :alt="`${lang} icon`"
              class="w-5 h-5 mr-2"
              :class="{
                'opacity-50': !selectedFilters.language.includes(lang),
              }"
            />
            {{ lang }}
          </label>
        </div>
      </div> -->

      <!-- Category filter -->
      <div class="mb-4">
        <h4 class="font-medium mb-1">Category</h4>
        <div
          v-for="category in uniqueCategories"
          :key="category.name"
          class="mb-1"
        >
          <label class="flex items-center cursor-pointer">
            <input
              type="checkbox"
              :value="category.name"
              v-model="selectedFilters.category"
              class="hidden"
            />
            <span class="flex items-center">
              <img
                :src="getCategoryIcon(category.icon)"
                :alt="`${category.name} icon`"
                class="w-5 h-5 mr-2"
                :class="{
                  'opacity-50': !selectedFilters.category.includes(
                    category.name
                  ),
                }"
              />
              {{ category.name }}
            </span>
          </label>
        </div>
      </div>

      <!-- Subcategory filter -->
      <div>
        <h4 class="font-medium mb-1">Subcategory</h4>
        <div
          v-for="subcategory in uniqueSubcategories"
          :key="subcategory"
          class="mb-1"
        >
          <label class="flex items-center cursor-pointer">
            <input
              type="checkbox"
              :value="subcategory"
              v-model="selectedFilters.subcategory"
              class="mr-2"
            />
            {{ subcategory }}
          </label>
        </div>
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
          <h3 class="font-bold">{{ template.name }}</h3>
          <p>
            {{ template.style }} based {{ template.language }} ({{
              template.filetype
            }})
          </p>
          <p class="text-sm text-gray-600">{{ template.description }}</p>
          <p class="text-xs text-gray-500 mt-2">
            Category: {{ template.category }} | Subcategory:
            {{ template.subcategory }}
          </p>
          <div v-if="validationStatus.errors.length > 0" class="text-red-600">
            <h4>Errors</h4>
            <ul>
              <li v-for="error in validationStatus.errors" :key="error">
                {{ error }}
              </li>
            </ul>
          </div>
          <div
            v-if="validationStatus.warnings.length > 0"
            class="text-yellow-600"
          >
            <h4>Warnings</h4>
            <ul>
              <li v-for="warning in validationStatus.warnings" :key="warning">
                {{ warning }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div
        v-if="
          validationStatus.errors.length > 0 ||
          validationStatus.warnings.length > 0
        "
        class="mt-4 p-4 border rounded"
      >
        <div v-if="validationStatus.errors.length > 0" class="mb-4">
          <h4 class="text-red-600 font-semibold mb-2">Errors:</h4>
          <ul class="list-disc list-inside">
            <li
              v-for="(error, index) in validationStatus.errors"
              :key="index"
              class="text-red-600"
            >
              {{ error }}
            </li>
          </ul>
        </div>

        <div v-if="validationStatus.warnings.length > 0">
          <h4 class="text-yellow-600 font-semibold mb-2">Warnings:</h4>
          <ul class="list-disc list-inside">
            <li
              v-for="(warning, index) in validationStatus.warnings"
              :key="index"
              class="text-yellow-600"
            >
              {{ warning }}
            </li>
          </ul>
        </div>
      </div>
      <div v-if="validating" class="mt-4 text-gray-600">
        Validating template...
      </div>
      <button
        @click="submitSelection"
        class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        :disabled="!selectedTemplate || !validationStatus.isValid"
        :class="{ 'opacity-50 cursor-not-allowed': !validationStatus.isValid }"
      >
        Continue
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useGeneratorStore } from "../stores/generatorStore";
import { loadTemplates } from "../services/templateService";
import { log, error as logError } from "../utils/logger";
import { TemplateValidator } from "../services/templateValidator";

const router = useRouter();
const store = useGeneratorStore();
const templates = ref([]);
const selectedTemplate = ref(null);
const loading = ref(true);
const error = ref("");
const categoryIcons = ref([]);
const selectedFilters = ref({
  language: [],
  category: [],
  subcategory: [],
});

const uniqueLanguages = computed(() => [
  ...new Set(templates.value.map((t) => t.language)),
]);
const uniqueCategories = computed(() => {
  const categories = [...new Set(templates.value.map((t) => t.category))];
  return categories.map((name) => ({
    name,
    icon:
      templates.value.find((t) => t.category === name)?.categoryIcon ||
      "file_type_cfm.svg",
  }));
});
const uniqueSubcategories = computed(() => [
  ...new Set(templates.value.map((t) => t.subcategory)),
]);

const filteredTemplates = computed(() => {
  return templates.value.filter(
    (t) =>
      (selectedFilters.value.language.length === 0 ||
        selectedFilters.value.language.includes(t.language)) &&
      (selectedFilters.value.category.length === 0 ||
        selectedFilters.value.category.includes(t.category)) &&
      (selectedFilters.value.subcategory.length === 0 ||
        selectedFilters.value.subcategory.includes(t.subcategory))
  );
});

function getCategoryIcon(iconName) {
  return `/icons/${iconName}`;
}

const validationStatus = ref({
  errors: [],
  warnings: [],
  isValid: true,
});

const validator = ref(null);

onMounted(async () => {
  try {
    const result = await loadTemplates();
    if (!result.success) {
      error.value = result.message;
    }
    templates.value = result.templates;
  } catch (err) {
    error.value = "Failed to load templates";
  } finally {
    loading.value = false;
  }
});

function toggleFilter(filterType, value) {
  const index = selectedFilters.value[filterType].indexOf(value);
  if (index === -1) {
    selectedFilters.value[filterType].push(value);
  } else {
    selectedFilters.value[filterType].splice(index, 1);
  }
}

function validateTemplate(template) {
  if (!validator.value) {
    logError("Validator not initialized");
    return false;
  }

  const validation = validator.value.validateTemplate(template.id);
  validationStatus.value = {
    errors: validation.errors,
    warnings: validation.warnings,
    isValid: validation.errors.length === 0,
  };

  return validationStatus.value.isValid;
}

const validating = ref(false);

async function selectTemplate(template) {
  if (!template || !template.id) {
    console.error("Invalid template selected:", template);
    return;
  }

  try {
    // Store the full template object
    store.setSelectedTemplate(template);

    // Validate that we have all necessary data before proceeding
    if (!store.selectedTemplate) {
      throw new Error("Failed to set selected template");
    }
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

    // Navigate to generator view
    router.push({ name: "Generate" });
  } catch (error) {
    console.error("Error selecting template:", error);
    // Optionally show error to user
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

// Add this after your existing refs and computed properties
watch(
  () => store.availableTemplates,
  (newTemplates) => {
    console.log("Available templates changed:", newTemplates);
  },
  { immediate: true }
);

watch(
  () => store.templates,
  (newTemplates) => {
    console.log("All templates changed:", newTemplates);
  },
  { immediate: true }
);
</script>
