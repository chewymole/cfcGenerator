<template>
  <div>
    <div class="flex border-b border-gray-300">
      <div
        v-for="tab in tabs"
        :key="tab.tableName"
        @click="selectTab(tab.tableName)"
        :class="{
          'bg-blue-100 text-white border-b-2 border-blue-600':
            tab.name === activeTab,
          'bg-white text-gray-600 hover:bg-blue-100 hover:text-blue-600 border border-gray-300':
            tab.name !== activeTab,
        }"
        class="cursor-pointer py-1 px-4 text-lg font-large transition-colors duration-200 rounded-t-md"
      >
        {{ tab.tableName }}
      </div>
    </div>
    <div class="tab-content">
      <slot :activeTab="activeTab" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  tabs: Array,
});
const activeTab = ref(props.tabs[0]?.tableName || "");

function selectTab(name) {
  activeTab.value = name;
}
</script>

<style>
.tab-titles {
  display: flex;
}
.tab-titles div {
  cursor: pointer;
  padding: 10px;
}
.tab-titles div.active {
  font-weight: bold;
}
</style>
