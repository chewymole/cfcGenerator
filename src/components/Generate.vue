<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Generate Code</h2>
    <p>Selected Template: {{ selectedTemplate.displayName }}</p>
    <button
      @click="generateCode"
      class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Generate Code
    </button>
    <div v-if="error" class="mt-4 text-red-600">
      {{ error }}
    </div>
    <!--     
    <div v-if="generatedCode" class="mt-4">
      <h3 class="text-lg font-semibold mb-2">Generated Code:</h3>
      <div class="border p-2">
        <editor-content :editor="editor" />
      </div>
      <div class="mt-4">
        <button
          @click="saveCurrentFile"
          class="mr-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Save Current File
        </button>
      </div>
    </div> -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRouter } from "vue-router";
import { useGeneratorStore } from "../stores/generatorStore";
import { generateCode as localGenerateCode } from "../services/codeGenerator";

const store = useGeneratorStore();
const router = useRouter();
const selectedTemplate = computed(() => store.selectedTemplate);
const selectedTables = computed(() => store.selectedTables);
const tablesXML = computed(() => store.tablesXML);
const generatedCode = ref("");
const error = ref("");

onMounted(() => {
  console.log("Generate component mounted");
});

// watch(generatedCode, (newCode) => {
//   console.log("Generated code updated:", newCode);
//   if (editor.value && newCode) {
//     editor.value.commands.setContent(newCode);
//     console.log("Editor content set");
//   }
// });

// onBeforeUnmount(() => {
//   editor.value.destroy();
// });

async function generateCode() {
  error.value = ""; // Clear previous errors
  try {
    console.log("Generating code with:", {
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
    //console.log("Generated code:", code);
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

// function saveCurrentFile() {
//   const content = editor.value ? editor.value.getHTML() : generatedCode.value;
//   console.log("Content to save:", content);
//   const blob = new Blob([content], { type: "text/plain" });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = `${selectedTemplate.value}_generated_code.txt`;
//   document.body.appendChild(a);
//   a.click();
//   document.body.removeChild(a);
//   URL.revokeObjectURL(url);
// }

// function saveAllFiles() {
//   // Implement logic to save all generated files
//   // This might involve generating code for all templates and saving them
//   console.log("Save all files functionality to be implemented");
// }
</script>
