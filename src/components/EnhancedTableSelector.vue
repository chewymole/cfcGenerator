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
        <label class="flex items-center">
          <input
            type="checkbox"
            :value="table"
            v-model="selectedTables"
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
    selectedTables.value = [...filteredTables.value];
  } else {
    selectedTables.value = [];
  }
}

watch(selectedTables, (newValue) => {
  emit("update:selectedTables", newValue);
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
