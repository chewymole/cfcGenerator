<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
  >
    <div class="bg-white rounded-lg p-6 w-[800px] h-[600px] flex flex-col">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Preview XML</h3>
        <div class="space-x-2">
          <button
            @click="copyToClipboard"
            class="px-3 py-1 border rounded text-sm"
            :class="{ 'bg-green-500 text-white': copied }"
          >
            {{ copied ? "Copied!" : "Copy" }}
          </button>
          <button
            @click="$emit('close')"
            class="px-3 py-1 border rounded text-sm"
          >
            Close
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-hidden">
        <pre class="h-full overflow-auto p-4 bg-gray-50 font-mono text-sm">{{
          xml
        }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  xml: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["close"]);
const copied = ref(false);

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(props.xml);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    console.error("Failed to copy:", error);
  }
}
</script>
