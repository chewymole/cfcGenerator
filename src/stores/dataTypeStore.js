import { defineStore } from "pinia";
import {
  BASE_DATA_TYPES,
  LANGUAGE_MAPPINGS,
  SUPPORTED_LANGUAGES,
  SUPPORTED_DATABASES,
  SQL_TYPE_INFO,
} from "@config/dataTypeConfig.js";

export const useDataTypeStore = defineStore("dataTypes", {
  state: () => ({
    baseTypes: {},
    languageMappings: {},
    supportedLanguages: [],
    supportedDatabases: [],
    currentLanguage: "cfml",
  }),

  actions: {
    initialize() {
      this.baseTypes = SQL_TYPE_INFO;
      this.languageMappings = LANGUAGE_MAPPINGS;
      this.supportedLanguages = SUPPORTED_LANGUAGES;
      this.supportedDatabases = SUPPORTED_DATABASES;
    },

    getSupportedLanguages() {
      return this.supportedLanguages;
    },

    getSupportedDatabases() {
      return this.supportedDatabases;
    },

    setLanguage(language) {
      this.currentLanguage = language;
    },

    getDataTypesForLanguage(language = null) {
      const targetLang = language || this.currentLanguage;
      const mapping = this.languageMappings[targetLang];

      return Object.entries(this.baseTypes)
        .filter(([type]) => this.isTypeValidForLanguage(type, targetLang))
        .reduce((acc, [type, config]) => {
          const category = config.category;
          if (!acc[category]) acc[category] = [];

          acc[category].push({
            value: type,
            label: config.label,
            description: `${targetLang}: ${config.description}`,
          });

          return acc;
        }, {});
    },

    isTypeValidForLanguage(type, language) {
      const mapping = this.languageMappings[language];
      return Object.values(mapping).some((types) =>
        Array.isArray(types) ? types.includes(type) : types === type
      );
    },

    getDefaultLength(type) {
      return this.baseTypes[type]?.defaultLength;
    },

    getDefaultValue(type) {
      return this.baseTypes[type]?.defaultValue;
    },

    getSQLTypes(type) {
      return this.baseTypes[type]?.sqlTypes || [];
    },

    getTypeByName(name) {
      const ti = Object.values(SQL_TYPE_INFO);

      const si = ti.find(
        (type) => type.label.toLowerCase() === name.toLowerCase()
      );

      return si;
    },

    getTypeInfo(type) {
      return (
        SQL_TYPE_INFO[type] || {
          category: "other",
          label: type.toUpperCase(),
          description: "Custom type",
        }
      );
    },
  },
});
