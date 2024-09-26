<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Enter Data Source</h2>
    <input
      v-model="dataSource"
      @keyup.enter="validateDataSource"
      class="w-full p-2 border rounded mb-4"
      placeholder="Enter data source name"
    />
    <button
      @click="validateDataSource"
      class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Validate and Continue
    </button>
    <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useGeneratorStore } from "../stores/generatorStore";
import { validateDataSource as validateDataSourceAPI } from "../services/api";

const router = useRouter();
const store = useGeneratorStore();
const dataSource = ref("");
const error = ref("");

async function validateDataSource() {
  try {
    error.value = "";
    const result = await validateDataSourceAPI(dataSource.value);
    if (result.success) {
      store.setDataSource(dataSource.value);
      router.push({ name: "Tables" });
    } else {
      error.value = result.message || "Failed to validate data source";
    }
  } catch (err) {
    console.error("Error validating data source:", err);
    error.value = "An error occurred while validating the data source";
  }
}
</script>
