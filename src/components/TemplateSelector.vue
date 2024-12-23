<template>
  <div class="flex">
    <!-- Add button for editing generator.xml when in local mode -->
    <div v-if="isLocalMode" class="absolute top-4 right-4">
      <button
        class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        @click="editGeneratorXml"
      >
        Edit Generator XML
      </button>

      <button
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        @click="router.push({ name: 'TemplateCreator' })"
      >
        Create New Template
      </button>
    </div>

    <!-- Filter column -->
    <div class="w-1/4 pr-4">
      <h3 class="text-lg font-semibold mb-2">
        Filters
      </h3>

      <!-- Category filter -->
      <div class="mb-4">
        <h4 class="font-medium mb-1">
          Language
        </h4>
        <div
          v-for="category in uniqueCategories"
          :key="category.name"
          class="mb-1"
        >
          <label class="flex items-center cursor-pointer">
            <input
              v-model="selectedFilters.category"
              type="checkbox"
              class="hidden"
              :value="category.name"
            >
            <span class="flex items-center">
              <img
                class="w-5 h-5 mr-2"
                :class="{
                  'opacity-50': !selectedFilters.category.includes(
                    category.name
                  ),
                }"
                :src="getCategoryIcon(category.icon)"
                :alt="`${category.name} icon`"
              >
              {{ category.name }}
            </span>
          </label>
        </div>
      </div>

      <!-- Subcategory filter -->
      <div>
        <h4 class="font-medium mb-1">
          Subcategory
        </h4>
        <div
          v-for="subcategory in uniqueSubcategories"
          :key="subcategory"
          class="mb-1"
        >
          <label class="flex items-center cursor-pointer">
            <input
              v-model="selectedFilters.subcategory"
              class="mr-2"
              type="checkbox"
              :value="subcategory"
            >
            {{ subcategory }}
          </label>
        </div>
      </div>
    </div>

    <!-- Templates column -->
    <div class="w-3/4">
      <h2 class="text-xl font-semibold mb-4">
        Select a Template
      </h2>
      <div v-if="loading" class="text-gray-600">
        Loading templates...
      </div>
      <div v-else-if="error" class="text-red-600">
        {{ error }}
      </div>
      <div v-else-if="filteredTemplates.length === 0" class="text-gray-600">
        No templates available.
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div
          v-for="template in filteredTemplates"
          :key="template.name"
          class="border rounded p-4 cursor-pointer hover:bg-gray-100 relative group"
          :class="{ 'bg-blue-100': selectedTemplate === template }"
          @click="selectTemplate(template)"
        >
          <div
            v-if="isLocalMode"
            class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <button
              class="px-2 py-1 text-sm bg-blue-500 text-white rounded mr-2 hover:bg-blue-600"
              @click.stop="viewTemplate(template)"
            >
              View
            </button>
            <button
              class="px-2 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
              @click.stop="editTemplate(template)"
            >
              Edit
            </button>
          </div>

          <div class="flex">
            <img
              class="w-5 h-5 mr-2"                
              :src="getCategoryIcon(template.categoryIcon)"
              :alt="`${template.name} icon`"
            >
            <h3 class="font-bold w-90%">
              {{ template.name }}
            </h3>
          </div>
          <p>
            {{ template.style }} based {{ template.language }} ({{
              template.filetype
            }})
          </p>
          <p class="text-sm text-gray-600">
            {{ template.description }}
          </p>
          <p class="text-xs text-gray-500 mt-2">
            Category: {{ template.category }} | Subcategory:
            {{ template.subcategory }}
          </p>
          <div v-if="validationStatus.errors.length > 0" class="text-red-600">
            <h4>
              Errors
            </h4>
            <ul>
              <li v-for="err in validationStatus.errors" :key="err">
                {{ err }}
              </li>
            </ul>
          </div>
          <div
            v-if="validationStatus.warnings.length > 0"
            class="text-yellow-600"
          >
            <h4>
              Warnings
            </h4>
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
          <h4 class="text-red-600 font-semibold mb-2">
            Errors:
          </h4>
          <ul class="list-disc list-inside">
            <li
              v-for="(err, index) in validationStatus.errors"
              :key="index"
              class="text-red-600"
            >
              {{ err }}
            </li>
          </ul>
        </div>

        <div v-if="validationStatus.warnings.length > 0">
          <h4 class="text-yellow-600 font-semibold mb-2">
            Warnings:
          </h4>
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
        class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        :disabled="!selectedTemplate || !validationStatus.isValid"
        :class="{ 'opacity-50 cursor-not-allowed': !validationStatus.isValid }"
        @click="submitSelection"
      >
        Continue
      </button>
    </div>
  </div>
  <div
    v-if="showTemplateModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg p-6 w-3/4 h-3/4 flex flex-col">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">
          {{ isEditing ? "Edit" : "View" }} {{ activeTemplate?.name }}
        </h2>
        <button
          class="text-gray-500 hover:text-gray-700"
          @click="closeTemplateModal"
        >
          <span class="sr-only">Close</span>
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div class="flex-1 overflow-hidden">
        <textarea
          v-if="isEditing"
          v-model="editedTemplateContent"
          class="w-full h-full font-mono p-4 border rounded"
          :class="{ 'bg-gray-50': !isEditing }"
          :readonly="!isEditing"
        />
        <pre
          v-else
          class="w-full h-full overflow-auto p-4 bg-gray-50 rounded"
        >{{ editedTemplateContent }}</pre>
      </div>

      <div class="flex justify-end mt-4 space-x-2">
        <button
          v-if="isEditing"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          @click="saveTemplateChanges"
        >
          Save Changes
        </button>
        <button
          class="px-4 py-2 border rounded hover:bg-gray-50"
          @click="closeTemplateModal"
        >
          Close
        </button>
      </div>
    </div>
  </div>

  <!-- Add new modal for generator.xml -->
  <div
    v-if="showGeneratorXmlModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg p-6 w-3/4 h-3/4 flex flex-col">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">
          Edit Generator XML Definition
        </h2>
        <button
          class="text-gray-500 hover:text-gray-700"
          @click="closeGeneratorXmlModal"
        >
          <span class="sr-only">Close</span>
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div class="flex-1 overflow-hidden">
        <textarea
          v-model="generatorXmlContent"
          class="w-full h-full font-mono p-4 border rounded"
        />
      </div>

      <div class="flex justify-end mt-4 space-x-2">
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          @click="saveGeneratorXml"
        >
          Save Changes
        </button>
        <button
          class="px-4 py-2 border rounded hover:bg-gray-50"
          @click="closeGeneratorXmlModal"
        >
          Close
        </button>
      </div>
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
import { useSettingsStore } from "../stores/settingsStore";
import { useToast } from "vue-toastification";
import { TemplateFileService } from "../services/templateService";

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

const settingsStore = useSettingsStore();
const toast = useToast();

const isLocalMode = computed(() => settingsStore.isLocalEnvironment);
const showTemplateModal = ref(false);
const editedTemplateContent = ref("");
const isEditing = ref(false);
const activeTemplate = ref(null);

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
      // Validate store data before proceeding
      if (!store.wrapperFile || !store.includes) {
        logError(`Template ${template.displayName} failed to be stored:`,store)
        return;
      }
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

async function viewTemplate(template) {
  try {
    activeTemplate.value = template;
    const content = await TemplateFileService.loadTemplateContent(
      `/xsl/${template.template}`
    );
    editedTemplateContent.value = content;
    isEditing.value = false;
    showTemplateModal.value = true;
  } catch (err) {
    toast.error(`Failed to load template content: ${err.message}`);
  }
}

async function editTemplate(template) {
  try {
    activeTemplate.value = template;
    const content = await TemplateFileService.loadTemplateContent(
      `/xsl/${template.template}`
    );
    editedTemplateContent.value = content;
    isEditing.value = true;
    showTemplateModal.value = true;
  } catch (err) {
    logError("Error editing template:", err, template);
    toast.error(`Failed to load template content: ${err.message}`);
  }
}

function closeTemplateModal() {
  showTemplateModal.value = false;
  editedTemplateContent.value = "";
  activeTemplate.value = null;
  isEditing.value = false;
}

async function saveTemplateChanges() {
  try {
    if (!activeTemplate.value) return;

    await TemplateFileService.saveTemplateFile(
      `/xsl/${activeTemplate.value.template}`,
      editedTemplateContent.value
    );

    // Update the template in memory
    //activeTemplate.value = editedTemplateContent.value;

    toast.success("Template changes saved successfully");
    closeTemplateModal();
  } catch (err) {
    toast.error(`Failed to save template changes: ${err.message}`);
  }
}

// Add these new refs
const showGeneratorXmlModal = ref(false);
const generatorXmlContent = ref("");

// Add these new functions
async function editGeneratorXml() {
  try {
    const content = await TemplateFileService.loadGeneratorXml();
    generatorXmlContent.value = content;
    showGeneratorXmlModal.value = true;
  } catch (err) {
    toast.error(`Failed to load generator XML: ${err.message}`);
  }
}

async function saveGeneratorXml() {
  try {
    await TemplateFileService.saveGeneratorXml(generatorXmlContent.value);
    toast.success("Generator XML saved successfully");
    showGeneratorXmlModal.value = false;
    // Optionally reload the page or refresh templates
    window.location.reload();
  } catch (err) {
    toast.error(`Failed to save generator XML: ${err.message}`);
  }
}

function closeGeneratorXmlModal() {
  showGeneratorXmlModal.value = false;
  generatorXmlContent.value = "";
}
</script>
