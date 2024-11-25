<template>
  <div class="space-y-4">
    <div class="space-y-2">
      <label class="block">API Endpoint</label>
      <input
        v-model="apiEndpoint"
        type="text"
        class="w-full px-4 py-2 border rounded"
        placeholder="Enter API endpoint"
      />
    </div>

    <div v-if="tables.length" class="space-y-2">
      <h4 class="font-semibold">Available Tables</h4>
      <div class="grid grid-cols-3 gap-4">
        <div
          v-for="table in tables"
          :key="table.name"
          class="p-4 border rounded"
        >
          {{ table.name }}
        </div>
      </div>
    </div>

    <button
      @click="fetchTables"
      class="px-4 py-2 bg-blue-500 text-white rounded"
      :disabled="!apiEndpoint"
    >
      Fetch Tables
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const emit = defineEmits(["tables-loaded"]);
const apiEndpoint = ref("");
const tables = ref([]);

async function fetchTables() {
  try {
    const response = await axios.get(apiEndpoint.value);
    tables.value = response.data;
    emit("tables-loaded", tables.value);
  } catch (error) {
    console.error("Error fetching tables:", error);
    // Handle error
  }
}
</script>
