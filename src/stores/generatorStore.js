import { defineStore } from "pinia";
import { log } from "../utils/logger";
export const useGeneratorStore = defineStore("generator", {
  state: () => ({
    dataSource: "",
    selectedTables: [],
    selectedTemplate: null,
    generatedCode: "",
    generatedCodeFiles: [],
    tablesXML: "",
    wrapperFile: "",
    includes: [],
    templates: [],
  }),
  actions: {
    setDataSource(dataSource) {
      this.dataSource = dataSource;
      log("Data source set in store:", this.dataSource);
    },
    setSelectedTables(tables) {
      this.selectedTables = tables;
      log("Selected tables set in store:", this.selectedTables);
    },
    setSelectedTemplate(template) {
      this.selectedTemplate = template;
      log("Template set in store:", this.selectedTemplate);
    },
    setGeneratedCode(code) {
      this.generatedCode = code;
      log("Generated code set in store", code);
    },
    setTablesXML(xml) {
      this.tablesXML = xml;
      log("Tables XML set in store");
    },
    setWrapperFile(file) {
      this.wrapperFile = file;
    },
    setIncludes(includes) {
      this.includes = includes;
    },
    getWrapperFile() {
      return this.wrapperFile;
    },
    getIncludes() {
      return this.includes;
    },
    setTemplates(templates) {
      this.templates = templates;
    },
    getTemplates() {
      return this.templates;
    },
    getSelectedTemplate() {
      return this.SelectedTemplate;
    },
    setGeneratedCodeFiles(files) {
      this.generatedCodeFiles = files;
    },
    setGeneratedCodeFile(fileName, content) {
      const fileIndex = this.generatedCodeFiles.findIndex(
        (file) => file.tableName === fileName
      );
      if (fileIndex !== -1) {
        this.generatedCodeFiles[fileIndex].code = content;
      } else {
        this.generatedCodeFiles.push({ tableName: fileName, code: content });
      }
    },
    getGeneratedCodeFiles() {
      return this.generatedCodeFiles;
    },
  },
});
