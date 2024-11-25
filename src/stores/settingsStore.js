import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    debugMode: false,
    isLocalEnvironment: false,
    preferences: {
      logLevel: 'error', // 'none', 'error', 'warn', 'info', 'debug'
    }
  }),

  getters: {
    isDebugEnabled: (state) => state.debugMode,
    getLogLevel: (state) => state.preferences.logLevel,
    isLocal: (state) => state.isLocalEnvironment,
  },

  actions: {
    toggleDebug() {
      this.debugMode = !this.debugMode;
    },

    setLogLevel(level) {
      this.preferences.logLevel = level;
    },

    detectEnvironment() {
      // Check if running locally
      const hostname = window.location.hostname;
      this.isLocalEnvironment = hostname === 'localhost' || 
                               hostname === '127.0.0.1' || 
                               hostname.includes('.local');
    },

    // Load settings from localStorage
    loadSettings() {
      const savedSettings = localStorage.getItem('app-settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        this.debugMode = settings.debugMode ?? false;
        this.preferences.logLevel = settings.logLevel ?? 'error';
      }
      this.detectEnvironment();
    },

    // Save settings to localStorage
    saveSettings() {
      localStorage.setItem('app-settings', JSON.stringify({
        debugMode: this.debugMode,
        logLevel: this.preferences.logLevel,
      }));
    }
  }
}); 