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
          <h3 class="font-bold">{{ template.displayName }}</h3>
          <p>
            {{ template.style }} based {{ template.language }} ({{
              template.type
            }})
          </p>
          <p class="text-sm text-gray-600">{{ template.description }}</p>
          <p class="text-xs text-gray-500 mt-2">
            Category: {{ template.category }} | Subcategory:
            {{ template.subcategory }}
          </p>
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

function toggleFilter(filterType, value) {
  const index = selectedFilters.value[filterType].indexOf(value);
  if (index === -1) {
    selectedFilters.value[filterType].push(value);
  } else {
    selectedFilters.value[filterType].splice(index, 1);
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
