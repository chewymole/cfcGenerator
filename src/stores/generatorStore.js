import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { log, error } from "../utils/logger";

const CACHE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB limit
const MAX_CACHE_ENTRIES = 10; // Maximum number of datasources to cache

export const useGeneratorStore = defineStore("generator", () => {
  // State
  const dataSource = ref("");
  const selectedTables = ref([]);
  const selectedTemplate = ref(null);
  const generatedCode = ref("");
  const generatedCodeFiles = ref([]);
  const generatedChildFiles = ref({}); // Add this new state property
  const tablesXML = ref("");
  const wrapperFile = ref("");
  const includes = ref([]);
  const templates = ref([]);
  const sourceType = ref("datasource");
  const selectedModel = ref(null);
  const cachedDatasources = ref(loadCachedDatasources());

  // Cache Management Functions
  function loadCachedDatasources() {
    try {
      const cached = localStorage.getItem("cachedDatasources");
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      error("Error loading cache:", error);
      return {};
    }
  }

  function calculateCacheSize() {
    try {
      const cacheStr = JSON.stringify(cachedDatasources.value);
      return new Blob([cacheStr]).size;
    } catch (error) {
      error("Error calculating cache size:", error);
      return 0;
    }
  }

  function trimCacheIfNeeded() {
    try {
      // Check total size
      if (calculateCacheSize() > CACHE_SIZE_LIMIT) {
        // Sort by timestamp and keep only recent entries
        const sortedEntries = Object.entries(cachedDatasources.value)
          .sort(([, a], [, b]) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, MAX_CACHE_ENTRIES);

        // Rebuild cache with only recent entries
        cachedDatasources.value = Object.fromEntries(sortedEntries);

        // If still too large, remove oldest until under limit
        while (
          calculateCacheSize() > CACHE_SIZE_LIMIT &&
          sortedEntries.length > 0
        ) {
          sortedEntries.pop();
          cachedDatasources.value = Object.fromEntries(sortedEntries);
        }

        // Save trimmed cache
        saveCache();
      }
    } catch (error) {
      error("Error trimming cache:", error);
    }
  }

  function saveCache() {
    try {
      localStorage.setItem(
        "cachedDatasources",
        JSON.stringify(cachedDatasources.value)
      );
    } catch (error) {
      if (error.name === "QuotaExceededError") {
        // Clear half of the existing cache if we hit storage limits
        const entries = Object.entries(cachedDatasources.value);
        const halfLength = Math.floor(entries.length / 2);
        cachedDatasources.value = Object.fromEntries(
          entries.slice(0, halfLength)
        );
        saveCache();
      }
      error("Error saving cache:", error);
    }
  }

  // Cache Operations
  function cacheDatasourceTables(datasourceName, tables) {
    try {
      cachedDatasources.value[datasourceName] = {
        timestamp: new Date().toISOString(),
        tables,
        size: new Blob([JSON.stringify(tables)]).size,
      };
      trimCacheIfNeeded();
      saveCache();
    } catch (error) {
      error("Error caching datasource:", error);
    }
  }

  function getCachedTables(datasourceName) {
    return cachedDatasources.value[datasourceName]?.tables;
  }

  function clearDatasourceCache(datasourceName) {
    try {
      delete cachedDatasources.value[datasourceName];
      saveCache();
    } catch (error) {
      error("Error clearing cache:", error);
    }
  }

  function clearAllCache() {
    try {
      cachedDatasources.value = {};
      localStorage.removeItem("cachedDatasources");
    } catch (error) {
      error("Error clearing all cache:", error);
    }
  }

  // Store Actions
  function setDataSource(value) {
    dataSource.value = value;
    log("Data source set in store:", value);
  }

  function setSelectedTables(tables) {
    selectedTables.value = tables;
    log("Selected tables set in store:", tables);
  }

  function setSelectedTemplate(template) {
    if (!template) {
      selectedTemplate.value = null;
      return;
    }

    // Make sure we store the full template object
    selectedTemplate.value = {
      id: template.id,
      name: template.name,
      filetype: template.filetype,
      style: template.style,
      template: template.template,
      includes: template.includes,
      children: template.children,
      compatibility: template.compatibility,
      description: template.description,
      language: template.language || "",
    };
    log("Selected template set in store:", selectedTemplate.value);
  }

  function setGeneratedCode(code) {
    generatedCode.value = code;
    log("Generated code set in store");
  }

  function setTablesXML(xml) {
    tablesXML.value = xml;
    log("Tables XML set in store");
  }

  function setWrapperFile(file) {
    wrapperFile.value = file;
  }

  function setIncludes(value) {
    includes.value = value;
  }

  function setTemplates(value) {
    templates.value = value;
  }

  function setGeneratedCodeFiles(files) {
    generatedCodeFiles.value = files;
  }

  function setGeneratedCodeFile(fileName, content) {
    const fileIndex = generatedCodeFiles.value.findIndex(
      (file) => file.tableName === fileName
    );
    if (fileIndex !== -1) {
      generatedCodeFiles.value[fileIndex].code = content;
    } else {
      generatedCodeFiles.value.push({ tableName: fileName, code: content });
    }
  }

  function setSourceType(type) {
    sourceType.value = type;
    log("Source type set in store:", type);
  }

  function setSelectedModel(model) {
    selectedModel.value = model;
    if (model?.tables) {
      setSelectedTables(model.tables);
    }
    log("Selected model set in store:", model);
  }

  function setGeneratedChildFile(tableName, templateId, code, filename) {
    log("Setting generated child file:", { tableName, templateId, filename });

    if (!this.generatedChildFiles) {
      this.generatedChildFiles = {};
    }

    if (!this.generatedChildFiles[tableName]) {
      this.generatedChildFiles[tableName] = {};
    }

    this.generatedChildFiles[tableName][templateId] = {
      code,
      filename,
      success: true,
      type: "child",
      error: null,
    };

    log("Updated generatedChildFiles:", this.generatedChildFiles);
  }

  // Computed
  const getCurrentTables = computed(() => {
    if (sourceType.value === "model" && selectedModel.value) {
      return selectedModel.value.tables;
    }
    return selectedTables.value;
  });

  // Template management
  function getTemplates() {
    return templates.value;
  }

  function getSelectedTemplate() {
    return selectedTemplate.value;
  }

  // Filter templates based on current source type and language
  const availableTemplates = computed(() => {
    if (!templates.value.length) return [];

    return templates.value.filter((template) => {
      // If using a model, check if template supports model source
      if (sourceType.value === "model") {
        return template.supportsModel !== false;
      }

      // If using datasource, check if template supports datasource
      if (sourceType.value === "datasource") {
        return template.supportsDatasource !== false;
      }

      return true;
    });
  });

  // Get includes for the selected template
  function getIncludes() {
    return selectedTemplate.value?.includes || [];
  }

  // Table management
  function setSelectedTables(tables) {
    selectedTables.value = tables;
  }

  function getSelectedTables() {
    return selectedTables.value;
  }

  // Get table names
  const tableNames = computed(() => {
    return selectedTables.value.map((table) => table.name);
  });

  // Getter for child files
  const getChildFiles = computed(() => (tableName) => {
    return generatedChildFiles.value[tableName] || {};
  });

  return {
    // State
    dataSource,
    selectedTables,
    selectedTemplate,
    generatedCode,
    generatedCodeFiles,
    tablesXML,
    wrapperFile,
    includes,
    templates,
    sourceType,
    selectedModel,
    cachedDatasources,
    generatedChildFiles,

    // Actions
    setDataSource,
    setSelectedTables,
    setSelectedTemplate,
    setGeneratedCode,
    setTablesXML,
    setWrapperFile,
    setIncludes,
    setTemplates,
    setGeneratedCodeFiles,
    setGeneratedCodeFile,
    setSourceType,
    setSelectedModel,
    setGeneratedChildFile,

    // Cache Operations
    cacheDatasourceTables,
    getCachedTables,
    clearDatasourceCache,
    clearAllCache,

    // Computed
    getCurrentTables,

    // Template management
    getTemplates,
    availableTemplates,
    setTemplates,
    getTemplates,
    setSelectedTemplate,
    getSelectedTemplate,
    getIncludes,
    selectedTables,
    setSelectedTables,
    getSelectedTables,
    tableNames,

    // Getter for child files
    getChildFiles,
  };
});
