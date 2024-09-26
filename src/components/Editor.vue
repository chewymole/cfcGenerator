<template>
  <div>
    <!-- <textarea
      v-model="content"
      class="code-editor"
      placeholder="Edit your code here..."
    >
    </textarea> -->

    <codemirror
      :modelValue="content"
      placeholder="code goes here..."
      :style="{ height: '60%', width: '80%' }"
      :autofocus="true"
      :indent-with-tab="true"
      :tab-size="4"
      :extensions="extensions"
      @ready="handleReady"
      @change="handleChange"
    />
    <button class="save-button" @click="save">Save</button>
  </div>
</template>

<script setup>
import { ref, defineProps, computed, watch, shallowRef } from "vue";
import { Codemirror } from "vue-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { basicSetup } from "codemirror";
import { log } from "../utils/logger";

const props = defineProps({
  fileName: {
    type: String,
    required: true,
    default: "",
  },
  fileContent: {
    type: String,
    required: true,
    default: "",
  },
  additionalExtensions: {
    type: Array,
    required: false,
    default: [],
  },
});

const emit = defineEmits(["save", "update:file-content", "update:file-name"]);

const content = ref(props.fileContent);
const fileName = ref(props.fileName);

const baseExtensions = [oneDark, basicSetup];

const extensions = computed(() => [
  ...baseExtensions,
  ...props.additionalExtensions,
]);

const view = shallowRef();
const handleReady = (payload) => {
  view.value = payload.view;
  const textContent = payload.view.state.doc.toString();
  emit("update:file-content", { name: fileName.value, cnt: textContent });
  log("handleReady called:", textContent);
};

const handleChange = (newValue) => {
  const textContent = newValue.view.state.doc.toString();
  view.value = newValue;
  emit("update:file-content", { name: fileName.value, cnt: textContent });
  log("handleChange called:", textContent);
};

// Watch for changes in the modelValue prop
watch(content, (newValue) => {
  content.value = newValue;
  log("updated content", content);
});

// Emit the updated content when saving
function save() {
  const textContent = view.value.state.doc.toString();
  log("Save: view :", textContent);
  emit("save", { name: fileName.value, cnt: textContent });
}
</script>

<style>
.editor-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.code-editor {
  width: 100%;
  height: 300px;
  padding: 10px;
  font-family: "Courier New", Courier, monospace; /* Monospace font for code */
  font-size: 14px; /* Font size */
  color: #f8f8f2; /* Text color */
  background-color: #282a36; /* Background color */
  border: 1px solid #44475a; /* Border color */
  border-radius: 4px; /* Rounded corners */
  resize: none; /* Disable resizing */
  outline: none; /* Remove outline */
  overflow: auto; /* Enable scrolling */
}

.code-editor::placeholder {
  color: #6272a4; /* Placeholder color */
}

.save-button {
  margin-top: 10px;
  padding: 10px 15px;
  background-color: #50fa7b; /* Button background color */
  color: #282a36; /* Button text color */
  border: none; /* Remove border */
  border-radius: 4px; /* Rounded corners */
  cursor: pointer; /* Pointer cursor */
  transition: background-color 0.3s; /* Transition for hover effect */
}

.save-button:hover {
  background-color: #45b05d; /* Darker green on hover */
}
</style>
