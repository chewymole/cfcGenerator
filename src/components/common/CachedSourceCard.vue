<template>
  <div
    class="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
  >
    <div class="flex justify-between items-start">
      <div class="flex-grow">
        <h4 class="font-medium text-gray-900">
          {{ name }}
        </h4>
        <p class="text-sm text-gray-500 mt-1">
          Last used: {{ formatDate(timestamp) }}
        </p>
      </div>
      <button
        class="text-gray-400 hover:text-red-500 p-1"
        title="Remove from cache"
        @click.stop="$emit('remove', name)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
    <button
      class="mt-3 w-full px-4 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors duration-200"
      @click="$emit('use', name)"
    >
      Use This Source
    </button>
  </div>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true,
  },
  timestamp: {
    type: String,
    required: true,
  }  
});
defineEmits(["remove", "use"]);

function formatDate(isoString) {
  return new Date(isoString).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>
