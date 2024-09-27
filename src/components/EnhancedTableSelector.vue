<template>
  <div class="enhanced-table-selector">
    <div class="mb-4">
      <input
        v-model="searchQuery"
        placeholder="Search tables..."
        class="w-full p-2 border rounded"
      />
    </div>

    <div class="mb-4">
      <label class="flex items-center">
        <input
          type="checkbox"
          v-model="selectAll"
          @change="toggleSelectAll"
          class="mr-2"
        />
        Select All
      </label>
    </div>

    <div class="table-list max-h-60 overflow-y-auto mb-4">
      <div v-for="table in paginatedTables" :key="table" class="mb-2">
        <label
          class="flex items-center"
          :class="{ 'opacity-50': isDisabled(table) }"
        >
          <input
            type="checkbox"
            :value="table"
            v-model="selectedTables"
            :disabled="isDisabled(table)"
            class="mr-2"
          />
          {{ table }}
        </label>
      </div>
    </div>

    <div class="pagination flex justify-between items-center">
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        class="px-2 py-1 border rounded"
        :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
      >
        Previous
      </button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="px-2 py-1 border rounded"
        :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }"
      >
        Next
      </button>
    </div>

    <div class="mt-4">
      Selected: {{ selectedTables.length }} / {{ MAX_SELECTED }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  tables: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["update:selectedTables"]);

const selectedTables = ref([]);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = 10;
const selectAll = ref(false);
// Use the MAX_SELECTED value from config.js, with a fallback value of 10
const MAX_SELECTED = window.APP_CONFIG?.MAX_SELECTED_TABLES || 10;

const filteredTables = computed(() => {
  return props.tables.filter((table) =>
    table.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const paginatedTables = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredTables.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredTables.value.length / itemsPerPage);
});

function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

function toggleSelectAll() {
  if (selectAll.value) {
    const availableSlots = MAX_SELECTED - selectedTables.value.length;
    const tablesToAdd = filteredTables.value.slice(0, availableSlots);
    selectedTables.value = [
      ...new Set([...selectedTables.value, ...tablesToAdd]),
    ];
  } else {
    selectedTables.value = selectedTables.value.filter(
      (table) => !filteredTables.value.includes(table)
    );
  }
}

function isDisabled(table) {
  return (
    selectedTables.value.length >= MAX_SELECTED &&
    !selectedTables.value.includes(table)
  );
}

watch(selectedTables, (newValue) => {
  if (newValue.length > MAX_SELECTED) {
    selectedTables.value = newValue.slice(0, MAX_SELECTED);
  }
  emit("update:selectedTables", selectedTables.value);
  selectAll.value = filteredTables.value.every((table) =>
    selectedTables.value.includes(table)
  );
});

watch(searchQuery, () => {
  currentPage.value = 1; // Reset to first page when search query changes
});
</script>

<style scoped>
.enhanced-table-selector {
  /* Add any additional styling here */
}
</style>
