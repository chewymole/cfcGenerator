<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4 text-gray-800">Generating Code</h2>
    <p class="text-gray-700">
      Generating code for {{ selectedTables.length }} table(s) using template:
      {{ selectedTemplate.name }}
    </p>
    <button
      @click="generate"
      class="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
    >
      Generate
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { generateXMLFromTables, transformXML } from "../utils/codeGenerator";

const props = defineProps(["selectedTables", "selectedTemplate"]);
const emit = defineEmits(["generation-complete"]);

async function generate() {
  try {
    const xmlContent = generateXMLFromTables(props.selectedTables);
    const templateResponse = await axios.get(
      `/xsl/${props.selectedTemplate.file}`
    );
    const xslContent = templateResponse.data;

    const generatedCode = transformXML(xmlContent, xslContent);
    emit("generation-complete", [
      { name: props.selectedTemplate.name, content: generatedCode },
    ]);
  } catch (error) {
    console.error("Error generating code:", error);
    // Handle error (e.g., show an error message to the user)
  }
}
</script>
