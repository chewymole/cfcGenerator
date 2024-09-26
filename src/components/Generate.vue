<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Generate Code</h2>
    <p>
      Selected Template: <strong>{{ selectedTemplate.displayName }}</strong
      ><br />
      A {{ selectedTemplate.style }} based format with a
      {{ selectedTemplate.type }} file extention. <br />
      {{ selectedTemplate.description }}
    </p>
    <button
      @click="generateCode"
      class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Generate Code
    </button>
    <div v-if="error" class="mt-4 text-red-600">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useGeneratorStore } from "../stores/generatorStore";
import { log } from "../utils/logger";
import { generateCode as localGenerateCode } from "../services/codeGenerator";

const store = useGeneratorStore();
const router = useRouter();
const selectedTemplate = computed(() => store.selectedTemplate);
const selectedTables = computed(() => store.selectedTables);
const tablesXML = computed(() => store.tablesXML);
const generatedCode = ref("");
const error = ref("");

async function generateCode() {
  error.value = ""; // Clear previous errors
  try {
    log("Generating code with:", {
      template: selectedTemplate.value,
      tables: selectedTables.value,
      tablesXML: tablesXML.value,
    });
    if (!tablesXML.value) {
      throw new Error(
        "Tables XML is missing. Please ensure tables are selected."
      );
    }
    const code = await localGenerateCode(
      selectedTemplate.value,
      selectedTables.value,
      tablesXML.value
    );
    //log("Generated code:", code);
    if (code) {
      //generatedCode.value = code;
      //store.setGeneratedCode(code);
      router.push({ name: "ViewCode" });
    } else {
      throw new Error("Generated code is empty or only whitespace");
    }
  } catch (err) {
    console.error("Error generating code:", err);
    error.value = `Error generating code: ${err.message}`;
    generatedCode.value = "";
  }
}
</script>
