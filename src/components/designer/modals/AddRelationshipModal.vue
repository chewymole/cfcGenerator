<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
  >
    <div class="bg-white rounded-lg p-6 w-[500px]">
      <h3 class="text-lg font-semibold mb-4">Add Relationship</h3>

      <!-- Relationship Form -->
      <div class="space-y-4">
        <!-- From Table -->
        <div>
          <label class="block text-sm mb-1">From Table</label>
          <select
            v-model="relationship.from"
            class="w-full px-3 py-2 border rounded"
          >
            <option value="">Select table</option>
            <option
              v-for="table in tables"
              :key="table.name"
              :value="table.name"
            >
              {{ table.name }}
            </option>
          </select>
        </div>

        <!-- Relationship Type -->
        <div>
          <label class="block text-sm mb-1">Relationship Type</label>
          <select
            v-model="relationship.type"
            class="w-full px-3 py-2 border rounded"
          >
            <option value="">Select type</option>
            <option value="hasOne">Has One</option>
            <option value="hasMany">Has Many</option>
            <option value="belongsTo">Belongs To</option>
            <option value="manyToMany">Many To Many</option>
          </select>
        </div>

        <!-- To Table -->
        <div>
          <label class="block text-sm mb-1">To Table</label>
          <select
            v-model="relationship.to"
            class="w-full px-3 py-2 border rounded"
          >
            <option value="">Select table</option>
            <option
              v-for="table in tables"
              :key="table.name"
              :value="table.name"
              :disabled="table.name === relationship.from"
            >
              {{ table.name }}
            </option>
          </select>
        </div>

        <!-- Additional Options -->
        <div v-if="relationship.type === 'manyToMany'">
          <label class="block text-sm mb-1">Pivot Table</label>
          <input
            v-model="relationship.pivotTable"
            type="text"
            class="w-full px-3 py-2 border rounded"
            :placeholder="`${relationship.from}_${relationship.to}`"
          />
        </div>

        <!-- Foreign Key -->
        <div>
          <label class="block text-sm mb-1">Foreign Key</label>
          <input
            v-model="relationship.foreignKey"
            type="text"
            class="w-full px-3 py-2 border rounded"
            :placeholder="defaultForeignKey"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-2 mt-6">
        <button @click="$emit('close')" class="px-4 py-2 border rounded">
          Cancel
        </button>
        <button
          @click="addRelationship"
          class="px-4 py-2 bg-blue-500 text-white rounded"
          :disabled="!isValid"
        >
          Add Relationship
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  tables: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["close", "add"]);

const relationship = ref({
  from: "",
  to: "",
  type: "",
  foreignKey: "",
  pivotTable: "",
});

const defaultForeignKey = computed(() => {
  if (!relationship.value.to) return "";
  return `${relationship.value.to.toLowerCase()}_id`;
});

const isValid = computed(() => {
  return (
    relationship.value.from &&
    relationship.value.to &&
    relationship.value.type &&
    relationship.value.from !== relationship.value.to
  );
});

function addRelationship() {
  if (isValid.value) {
    emit("add", {
      ...relationship.value,
      foreignKey: relationship.value.foreignKey || defaultForeignKey.value,
      pivotTable:
        relationship.value.pivotTable ||
        `${relationship.value.from}_${relationship.value.to}`,
    });
    emit("close");
  }
}
</script>
