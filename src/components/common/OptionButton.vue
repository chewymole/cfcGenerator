<template>
  <button
    class="px-4 py-2 rounded-lg transition-colors duration-200"
    :class="{
      'bg-blue-500 text-white': selected,
      'bg-gray-100 hover:bg-gray-200 text-gray-700': !selected,
    }"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  selected: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["click"]);
</script>
