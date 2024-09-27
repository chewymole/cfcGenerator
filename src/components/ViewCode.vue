<!-- <template>
  <div>
    <h2 class="text-xl font-semibold mb-4">View Generated Code</h2>
    <p>Selected Template: {{ selectedTemplate }}</p>
    <pre><code>{{ generatedCode }}</code></pre>
  </div>
</template> -->
<template>
  <div>
    <button
      class="flex items-center bg-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200 ml-auto"
      @click="saveAll"
    >
      <i class="fas fa-save mr-2"></i>
      <!-- Font Awesome Save Icon -->
      Save All
    </button>
    <h2 class="text-lg font-semibold">Code Editor</h2>
    <p>
      Selected Template: <strong>{{ selectedTemplate.displayName }}</strong
      ><br />
      A {{ selectedTemplate.style }} based format with a
      {{ selectedTemplate.type }} file extention. <br />
      {{ selectedTemplate.description }}
    </p>

    <Tabs :tabs="generatedFiles">
      <template #default="{ activeTab }">
        <div
          v-for="file in generatedFiles"
          :key="file.tableName"
          v-show="file.tableName === activeTab"
        >
          <Editor
            :fileContent="file.code"
            :fileName="file.tableName"
            @save="saveCurrentFile"
            @update:file-content="storeChanges"
          />
        </div>
      </template>
    </Tabs>
  </div>
</template>

<script setup>
import { computed, shallowRef } from "vue";
import { useGeneratorStore } from "../stores/generatorStore";
import Tabs from "./Tabs.vue"; // Your Tabs component
import Editor from "./Editor.vue"; // Your WYSIWYG editor component
import { log } from "../utils/logger";

const store = useGeneratorStore();
const generatedFiles = computed(() => store.generatedCodeFiles);
const selectedTemplate = computed(() => store.selectedTemplate);
const files = shallowRef([]);
files.value = generatedFiles.value.map((file) => ({
  name: file.tableName,
  cnt: file.code,
}));

function saveCurrentFile(info) {
  log("Content to save:", info.name, info.cnt);
  const blob = new Blob([info.cnt], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${info.name}.cfc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function storeChanges(view) {
  const fileIndex = files.value.findIndex((file) => file.name === view.name);
  if (fileIndex !== -1) {
    files.value[fileIndex].content = view.cnt;
  } else {
    files.value.push({ name: view.name, content: view.cnt });
  }
  log("Global file update event:", files.value);
}

function saveAll() {
  files.value.forEach((file) => saveCurrentFile(file));
  log("Save all", files.value);
}
</script>
