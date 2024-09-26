import { defineStore } from "pinia";

export const useGeneratorStore = defineStore("generator", {
  state: () => ({
    dataSource: "",
    selectedTables: [],
    selectedTemplate: "",
    generatedCode: "",
    generatedCodeFiles: [],
    tablesXML: "",
    wrapperFile: "",
    includes: [],
    templates: [],
    cart: [],
  }),
  actions: {
    setDataSource(dataSource) {
      this.dataSource = dataSource;
      console.log("Data source set in store:", this.dataSource);
    },
    setSelectedTables(tables) {
      this.selectedTables = tables;
      console.log("Selected tables set in store:", this.selectedTables);
    },
    setSelectedTemplate(template) {
      this.selectedTemplate = template;
      console.log("Template set in store:", this.selectedTemplate);
    },
    setGeneratedCode(code) {
      this.generatedCode = code;
      console.log("Generated code set in store");
    },
    setTablesXML(xml) {
      this.tablesXML = xml;
      console.log("Tables XML set in store");
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
    setCart(items) {
      this.cart = items;
    },
    getCart() {
      return this.cart;
    },

    getSelectedTemplate() {
      return this.SelectedTemplate;
    },
    setGeneratedCodeFiles(files) {
      this.generatedCodeFiles = files;
    },
    getGeneratedCodeFiles() {
      return this.generatedCodeFiles;
    },
  },
});
