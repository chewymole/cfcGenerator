<template>
  <div class="space-y-4">
    <div>
      <label
        for="datasource"
        class="block text-sm font-medium text-gray-700 mb-1"
      >
        Data Source Name
      </label>
      <div class="flex space-x-3">
        <input
          id="datasource"
          type="text"
          :value="modelValue"
          class="flex-grow px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your datasource name"
          :class="{ 'border-red-300': error }"
          @input="$emit('update:modelValue', $event.target.value)"
        >
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          :disabled="!modelValue"
          @click="$emit('validate')"
        >
          Continue
        </button>
      </div>
      <p v-if="error" class="mt-2 text-sm text-red-600">
        {{ error }}
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  error: {
    type: String,
    default: "",
  },
});

defineEmits(["update:modelValue", "validate"]);
</script>
