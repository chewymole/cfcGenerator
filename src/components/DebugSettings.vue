<template>
  <div class="debug-settings divide-y divide-gray-200">
    <!-- Debug Mode -->
    <div class="setting-section py-4">
      <h4 class="text-lg font-medium text-gray-900 mb-4">
        Debug Options
      </h4>
      <div class="space-y-4">
        <div
          class="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
        >
          <div class="flex flex-col">
            <span class="text-gray-900 font-medium">Debug Mode</span>
            <span class="text-sm text-gray-500">Enable detailed logging and debugging features</span>
          </div>
          <label class="switch">
            <input
              type="checkbox"
              :checked="settings.debugMode"
              @change="settings.toggleDebug()"
            >
            <span class="slider round" />
          </label>
        </div>

        <div
          class="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
        >
          <div class="flex flex-col">
            <span class="text-gray-900 font-medium">Log Level</span>
            <span class="text-sm text-gray-500">Set the detail level of application logs</span>
          </div>
          <select
            v-model="selectedLogLevel"
            class="form-select rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            @change="updateLogLevel"
          >
            <option value="none">
              None
            </option>
            <option value="error">
              Error
            </option>
            <option value="warn">
              Warning
            </option>
            <option value="info">
              Info
            </option>
            <option value="debug">
              Debug
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Environment Info -->
    <div class="setting-section py-4">
      <h4 class="text-lg font-medium text-gray-900 mb-4">
        Environment
      </h4>
      <div class="bg-white p-4 rounded-lg border border-gray-200">
        <div class="flex items-center space-x-3">
          <div
            class="w-3 h-3 rounded-full"
            :class="settings.isLocal ? 'bg-green-500' : 'bg-blue-500'"
          />
          <div class="flex flex-col">
            <span class="text-gray-900 font-medium">
              {{
                settings.isLocal ? "Local Environment" : "Hosted Environment"
              }}
            </span>
            <span class="text-sm text-gray-500">
              {{
                settings.isLocal
                  ? "Running on localhost with full system access"
                  : "Running on remote server with restricted access"
              }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Template Editor (only in local environment) 
    <div v-if="settings.isLocal" class="setting-section py-4">
      <h4 class="text-lg font-medium text-gray-900 mb-4">Template Editor</h4>
      <div class="bg-white p-4 rounded-lg border border-gray-200">
        <button
          @click="showTemplateEditor = !showTemplateEditor"
          class="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {{ showTemplateEditor ? "Hide" : "Show" }} Template Editor
        </button>

        <div v-if="showTemplateEditor" class="mt-4">
          <p class="text-gray-600">
            Template editor functionality coming soon...
          </p>
        </div>
      </div>
    </div>-->
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useSettingsStore } from "../stores/settingsStore";

const settings = useSettingsStore();
const selectedLogLevel = ref(settings.getLogLevel);
const showTemplateEditor = ref(false);

function updateLogLevel() {
  settings.setLogLevel(selectedLogLevel.value);
  settings.saveSettings();
}

onMounted(() => {
  settings.loadSettings();
});
</script>

<style scoped>
select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

/* Ensure consistent height across browsers */
select,
option {
  min-height: 2.5rem;
  color: #000;
}
.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e0;
  transition: 0.4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.4s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.slider.round {
  border-radius: 24px;
}

.slider.round:before {
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #3b82f6;
}

input:checked + .slider:before {
  transform: translateX(24px);
}

.setting-section:first-child {
  padding-top: 0;
}

.setting-section:last-child {
  padding-bottom: 0;
}
</style>
