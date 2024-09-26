<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4 text-gray-800">Generated Code</h2>
    <div v-for="file in generatedFiles" :key="file.tableName" class="mb-4">
      <h3 class="text-lg font-semibold text-gray-700">{{ file.tableName }}</h3>
      <textarea
        v-model="file.content"
        rows="10"
        class="w-full p-2 border rounded text-gray-800 bg-gray-50"
      ></textarea>
    </div>
    <button
      @click="saveAll"
      class="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
    >
      Save All
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps(["generatedFiles"]);
const emit = defineEmits(["save-files"]);

const editedFiles = ref(props.generatedFiles);

function saveAll() {
  emit("save-files", editedFiles.value);
}
</script>
