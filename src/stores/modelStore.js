import { defineStore } from "pinia";
import { ref } from "vue";
import { useToast } from "vue-toastification";
import { useDataTypeStore } from "./dataTypeStore";
import { log, error } from "../utils/logger";

export const useModelStore = defineStore("model", () => {
  const models = ref([]);
  const currentModel = ref(null);
  const modelVersions = ref({});
  const lastBackup = ref(null);
  const toast = useToast();
  const initialized = ref(false);
  const dataTypeStore = useDataTypeStore();

  // Validation rules for models
  const validationRules = {
    name: {
      required: true,
      minLength: 3,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_\-\s]+$/,
    },
    tables: {
      required: true,
      minItems: 1,
    },
    columns: {
      required: true,
      minItems: 1,
    },
  };

  // Load models from localStorage
  async function loadModels() {
    if (initialized.value) {
      return models.value;
    }

    try {
      const savedModels = localStorage.getItem("customModels");
      if (savedModels) {
        models.value = JSON.parse(savedModels);
        log("Loaded models from storage:", models.value);
      }
      initialized.value = true;
      return models.value;
    } catch (err) {
      error("Error loading models:", err);
      models.value = [];
      return [];
    }
  }

  // Validate model data
  function validateModel(model) {
    const errors = [];

    // Validate name
    if (!model.name) {
      errors.push("Model name is required");
    } else {
      if (model.name.length < validationRules.name.minLength) {
        errors.push(
          `Name must be at least ${validationRules.name.minLength} characters`
        );
      }
      if (model.name.length > validationRules.name.maxLength) {
        errors.push(
          `Name must be no more than ${validationRules.name.maxLength} characters`
        );
      }
      if (!validationRules.name.pattern.test(model.name)) {
        errors.push(
          "Name can only contain letters, numbers, spaces, underscores, and hyphens"
        );
      }
    }

    // Validate tables
    if (!model.tables || model.tables.length === 0) {
      errors.push("At least one table is required");
    } else {
      model.tables.forEach((table, tableIndex) => {
        if (!table.columns || table.columns.length === 0) {
          errors.push(`Table ${tableIndex + 1} must have at least one column`);
        } else {
          table.columns.forEach((column, columnIndex) => {
            // Validate column name
            if (!column.name) {
              errors.push(
                `Column ${columnIndex + 1} in table ${tableIndex + 1} must have a name`
              );
            } else if (!/^[a-zA-Z0-9_]+$/.test(column.name)) {
              errors.push(
                `Column name '${column.name}' in table ${tableIndex + 1} is invalid`
              );
            }

            // Validate column type
            if (!column.type) {
              errors.push(
                `Missing type for column '${column.name}' in table ${tableIndex + 1}`
              );
            } else {
              const typeFound = dataTypeStore.getTypeByName(column.type);

              if (!typeFound) {
                errors.push(
                  `Invalid type '${column.type}' for column '${column.name}' in table ${tableIndex + 1}`
                );
              }

              // Validate length if required
              if (
                dataTypeStore.getDefaultLength(column.type) !== null &&
                !column.length
              ) {
                errors.push(
                  `Length is required for column '${column.name}' of type '${column.type}' in table ${tableIndex + 1}`
                );
              }
            }

            // Validate default value if not nullable
            if (
              !column.isNullable &&
              !column.isPrimaryKey &&
              column.defaultValue === null
            ) {
              // errors.push(
              //   `Default value is required for non-nullable column '${column.name}' in table ${tableIndex + 1}`
              // );
            }
          });
        }
      });
    }

    return errors;
  }

  // Create version for model
  function createVersion(modelId, changes = "") {
    if (!modelVersions.value[modelId]) {
      modelVersions.value[modelId] = [];
    }

    const model = models.value.find((m) => m.id === modelId);
    if (!model) return;

    const version = {
      id: crypto.randomUUID(),
      modelId,
      version: modelVersions.value[modelId].length + 1,
      data: JSON.parse(JSON.stringify(model)),
      changes,
      timestamp: new Date().toISOString(),
    };

    modelVersions.value[modelId].push(version);
    localStorage.setItem("modelVersions", JSON.stringify(modelVersions.value));
    return version;
  }

  // Get versions for a model
  function getModelVersions(modelId) {
    return modelVersions.value[modelId] || [];
  }

  // Restore model to specific version
  async function restoreVersion(modelId, versionId) {
    const versions = modelVersions.value[modelId];
    if (!versions) return null;

    const version = versions.find((v) => v.id === versionId);
    if (!version) return null;

    return await updateModel(version.data);
  }

  // Export models
  function exportModels(modelIds = null) {
    const exportData = {
      models: modelIds
        ? models.value.filter((m) => modelIds.includes(m.id))
        : models.value,
      versions: modelIds
        ? Object.fromEntries(
            Object.entries(modelVersions.value).filter(([key]) =>
              modelIds.includes(key)
            )
          )
        : modelVersions.value,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `models-export-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Import models
  async function importModels(fileContent) {
    try {
      const importData = JSON.parse(fileContent);

      // Validate import data
      if (!importData.models || !Array.isArray(importData.models)) {
        throw new Error("Invalid import data format");
      }

      // Create backup before import
      await createBackup();

      // Merge imported models with existing ones
      importData.models.forEach((model) => {
        const existingIndex = models.value.findIndex((m) => m.id === model.id);
        if (existingIndex === -1) {
          models.value.push(model);
        } else {
          models.value[existingIndex] = model;
        }
      });

      // Merge versions if they exist
      if (importData.versions) {
        modelVersions.value = {
          ...modelVersions.value,
          ...importData.versions,
        };
      }

      // Save everything
      saveModelsToStorage();
      localStorage.setItem(
        "modelVersions",
        JSON.stringify(modelVersions.value)
      );

      return {
        success: true,
        modelsImported: importData.models.length,
      };
    } catch (err) {
      error("Error importing models:", err);
      throw new Error("Failed to import models: " + err.message);
    }
  }

  // Create backup
  async function createBackup() {
    const backup = {
      models: JSON.parse(JSON.stringify(models.value)),
      versions: JSON.parse(JSON.stringify(modelVersions.value)),
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem("modelsBackup", JSON.stringify(backup));
    lastBackup.value = backup;
    return backup;
  }

  // Restore from backup
  async function restoreFromBackup() {
    try {
      const backup = localStorage.getItem("modelsBackup");
      if (!backup) {
        throw new Error("No backup found");
      }

      const backupData = JSON.parse(backup);
      models.value = backupData.models;
      modelVersions.value = backupData.versions;
      saveModelsToStorage();
      localStorage.setItem(
        "modelVersions",
        JSON.stringify(modelVersions.value)
      );

      return {
        success: true,
        timestamp: backupData.timestamp,
      };
    } catch (err) {
      error("Error restoring from backup:", err);
      throw new Error("Failed to restore from backup: " + err.message);
    }
  }

  // Get a specific model by ID
  async function getModelById(id) {
    if (!initialized.value) {
      await loadModels();
    }

    const model = models.value.find((m) => m.id === id);
    currentModel.value = model;
    log("Getting model by ID:", id, "Found:", model);
    return model;
  }

  // Save models to localStorage
  function saveModelsToStorage() {
    try {
      log("Saving models to storage:", models.value);
      localStorage.setItem("customModels", JSON.stringify(models.value));
      return true;
    } catch (err) {
      error("Error saving models:", err);
      return false;
    }
  }

  // Create a new model
  async function createModel(modelData) {
    try {
      log("Creating new model:", modelData);
      const validationErrors = validateModel(modelData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join("\n"));
      }

      const newModel = {
        id: crypto.randomUUID(),
        ...modelData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      models.value.push(newModel);
      saveModelsToStorage();
      toast.success("Model created successfully");
      return newModel;
    } catch (err) {
      error("Error creating model:", err);
      toast.error(`Failed to create model: ${err.message}`);
      throw err;
    }
  }

  // Update an existing model
  async function updateModel(modelData) {
    try {
      const validationErrors = validateModel(modelData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join("\n"));
      }

      const index = models.value.findIndex((m) => m.id === modelData.id);
      if (index === -1) {
        throw new Error("Model not found");
      }

      const updatedModel = {
        ...modelData,
        updatedAt: new Date().toISOString(),
      };

      models.value[index] = updatedModel;
      saveModelsToStorage();
      toast.success("Model updated successfully");
      return updatedModel;
    } catch (err) {
      error("Error updating model:", err);
      toast.error("Failed to update model");
      throw err;
    }
  }

  // Delete a model
  async function deleteModel(modelId) {
    try {
      // Find the model index
      const modelIndex = models.value.findIndex((m) => m.id === modelId);
      if (modelIndex === -1) {
        throw new Error("Model not found");
      }
      // Create backup before deletion
      await createBackup();

      // Remove the model
      models.value.splice(modelIndex, 1);

      // Save changes to storage
      saveModelsToStorage();

      // Clean up versions for this model
      if (modelVersions.value[modelId]) {
        delete modelVersions.value[modelId];
        localStorage.setItem(
          "modelVersions",
          JSON.stringify(modelVersions.value)
        );
      }
    } catch (err) {
      error("Error deleting model:", err);
      throw err;
    }
  }

  // Generate model XML
  function generateModelXML(modelId) {
    // Implementation for generating model XML
  }

  // Get all saved models
  function getSavedModels() {
    return models.value;
  }

  // Import a model
  async function importModel(modelData) {
    try {
      // Validate the imported data
      const validationErrors = validateModel(modelData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join("\n"));
      }

      // Create a new model with the imported data
      const newModel = {
        id: crypto.randomUUID(),
        ...modelData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        imported: true,
        importedAt: new Date().toISOString(),
      };

      // Check for name conflicts
      const existingModel = models.value.find((m) => m.name === newModel.name);
      if (existingModel) {
        newModel.name = `${newModel.name} (Imported)`;
      }

      models.value.push(newModel);

      if (saveModelsToStorage()) {
        toast.success("Model imported successfully");
      }

      return newModel;
    } catch (err) {
      error("Error importing model:", err);
      throw new Error("Failed to import model: " + err.message);
    }
  }

  // Rename a model
  async function renameModel(modelId, newName) {
    try {
      // Find the model
      const model = models.value.find((m) => m.id === modelId);
      if (!model) {
        throw new Error("Model not found");
      }

      // Validate the new name
      const validationErrors = validateModelName(newName);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join("\n"));
      }

      // Check for duplicate names
      const isDuplicate = models.value.some(
        (m) =>
          m.id !== modelId && m.name.toLowerCase() === newName.toLowerCase()
      );
      if (isDuplicate) {
        throw new Error("A model with this name already exists");
      }

      // Create version before renaming
      createVersion(modelId, `Renamed from "${model.name}" to "${newName}"`);

      // Update the model
      model.name = newName;
      model.updatedAt = new Date().toISOString();

      // Save changes
      saveModelsToStorage();
      toast.success("Model renamed successfully");

      return model;
    } catch (err) {
      error("Error renaming model:", err);
      toast.error(`Failed to rename model: ${err.message}`);
      throw err;
    }
  }

  // Helper function to validate just the model name
  function validateModelName(name) {
    const errors = [];
    const { name: nameRules } = validationRules;

    if (!name) {
      errors.push("Model name is required");
    } else {
      if (name.length < nameRules.minLength) {
        errors.push(`Name must be at least ${nameRules.minLength} characters`);
      }
      if (name.length > nameRules.maxLength) {
        errors.push(
          `Name must be no more than ${nameRules.maxLength} characters`
        );
      }
      if (!nameRules.pattern.test(name)) {
        errors.push(
          "Name can only contain letters, numbers, spaces, underscores, and hyphens"
        );
      }
    }

    return errors;
  }

  return {
    models,
    currentModel,
    modelVersions,
    lastBackup,
    initialized,
    loadModels,
    getSavedModels,
    getModelById,
    createModel,
    updateModel,
    deleteModel,
    generateModelXML,
    validateModel,
    createVersion,
    getModelVersions,
    restoreVersion,
    exportModels,
    importModels,
    createBackup,
    restoreFromBackup,
    importModel,
    renameModel,
  };
});
