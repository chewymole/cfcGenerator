import { TemplateProcessor, TemplateResult } from "./templateProcessor";
import { XMLHandler, XMLResult } from "./xmlHandler";
import { fileManager, FileResult } from "./fileManager";
import { log, error } from "../utils/logger";
import { useGeneratorStore } from "../stores/generatorStore";

export class GenerationResult {
  constructor(success, data = null, error = null) {
    this.success = success;
    this.data = data;
    this.error = error;
  }

  static success(data) {
    return new GenerationResult(true, data);
  }

  static failure(error) {
    return new GenerationResult(false, null, error);
  }
}

class CodeGenerator {
  constructor() {
    this.store = useGeneratorStore();
    this.templateProcessor = new TemplateProcessor();
    this.xmlHandler = new XMLHandler();
    // Validate store initialization
    if (!this.store) {
      error("Store not properly initialized");
      throw new Error("Store not properly initialized");
    }
  }

  async generateCode(template, tableNames) {
    try {
      log("Starting code generation:", { template, tableNames });

      if (!template || !tableNames?.length) {
        throw new Error("Missing template or tables");
      }

      const results = [];

      // Process each table
      for (const table of tableNames) {
        try {
          // Extract table name
          const tableName = typeof table === "object" ? table.name : table;

          // Generate main template
          const mainResult = await this.generateTemplateCode(
            template,
            tableName
          );

          if (!mainResult.success) {
            throw new Error(mainResult.error);
          }

          const result = {
            tableName, // Use the extracted name
            mainFile: {
              code: mainResult.data,
              filename: fileManager.generateFilename({
                tableName,
                template,
                isChild: false,
              }).data.filename,
              type: "main",
            },
            childFiles: [],
            success: true,
          };

          // Process child templates if they exist
          if (template.children?.length) {
            const childResults = await this.processChildTemplates(
              tableName,
              template.children
            );
            result.childFiles = childResults;
          }

          results.push(result);
          log(`Generated code for table: ${tableName}`); // Use the extracted name
        } catch (err) {
          error(
            `Failed to process table ${typeof table === "object" ? table.name : table}:`,
            err
          );
          results.push({
            tableName: typeof table === "object" ? table.name : table,
            success: false,
            error: err.message,
          });
        }
      }

      // Store all results
      this.storeResults(results);

      return GenerationResult.success({
        results,
        successCount: results.filter((r) => r.success).length,
        totalCount: results.length,
      });
    } catch (err) {
      error("Code generation failed:", err);
      return GenerationResult.failure(err.message);
    }
  }

  async generateTemplateCode(template, tableName) {
    try {
      // Get includes
      const includes = this.store.getIncludes();

      // Process template and includes
      const processedTemplate = await this.templateProcessor.processTemplate(
        template.template,
        includes
      );

      if (!processedTemplate.success) {
        return GenerationResult.failure(processedTemplate.error);
      }

      // Create XSL processor
      const processor = this.templateProcessor.createProcessor(
        processedTemplate.content
      );
      if (!processor.success) {
        return GenerationResult.failure(processor.error);
      }

      // Extract table name if it's an object
      const tableNameStr =
        typeof tableName === "object" ? tableName.name : tableName;

      // Handle both datasource and model cases
      let tableXML;
      const model = this.store.selectedModel;
      const tablesXML = this.store.tablesXML;
      const isUsingModel = model && model.tables && model.tables.length > 0;

      if (isUsingModel) {
        // Using model
        log("Using model for table XML");
        const table = model.tables.find((t) => t.name === tableNameStr);

        if (!table) {
          return GenerationResult.failure(
            `Table ${tableNameStr} not found in model`
          );
        }

        tableXML = this.xmlHandler.createTableXML(table, model);
      } else if (tablesXML) {
        // Using datasource
        log("Using datasource for table XML");
        tableXML = this.xmlHandler.findTableInXML(tablesXML, tableNameStr);
      } else {
        return GenerationResult.failure("No valid model or tables XML found");
      }

      if (!tableXML?.success) {
        return GenerationResult.failure(
          tableXML?.error || "Failed to get table XML"
        );
      }

      // Transform XML
      const transformResult = this.xmlHandler.transformXML(
        tableXML.content,
        processor.content
      );

      return transformResult.success
        ? GenerationResult.success(transformResult.content)
        : GenerationResult.failure(transformResult.error);
    } catch (err) {
      error("Template code generation failed:", err);
      return GenerationResult.failure(err.message);
    }
  }

  async processChildTemplates(tableName, childTemplates) {
    const results = [];

    log("Processing child templates for", tableName, childTemplates);

    for (const child of childTemplates) {
      try {
        // Get child template definition
        const childTemplate = this.store
          .getTemplates()
          .find((t) => t.id === child.ref);

        log("Found child template:", childTemplate);

        if (!childTemplate) {
          throw new Error(`Child template ${child.ref} not found`);
        }

        // Generate child template code
        const childResult = await this.generateTemplateCode(
          childTemplate,
          tableName
        );

        log("Child template generation result:", childResult);

        if (childResult.success) {
          const filename = fileManager.generateFilename({
            tableName,
            template: childTemplate,
            isChild: true,
            childType: childTemplate.name,
          }).data.filename;

          results.push({
            code: childResult.data,
            filename,
            type: "child",
            templateId: child.ref,
          });

          log("Added child result:", results[results.length - 1]);
        } else {
          error(
            `Child template generation failed for ${tableName}:`,
            childResult.error
          );
        }
      } catch (err) {
        error(`Failed to process child template for ${tableName}:`, err);
      }
    }

    log("Final child template results:", results);
    return results;
  }

  storeResults(results) {
    // Store main files
    const mainFiles = results
      .filter((r) => r.success)
      .map((r) => ({
        tableName: r.tableName,
        code: r.mainFile.code,
        filename: r.mainFile.filename,
        success: true,
      }));

    this.store.setGeneratedCodeFiles(mainFiles);

    // Debug log before storing child files
    log(
      "Results with child files:",
      results.filter((r) => r.success && r.childFiles?.length > 0)
    );

    // Store child files
    results
      .filter((r) => r.success && r.childFiles?.length > 0)
      .forEach((r) => {
        log(`Processing child files for table ${r.tableName}:`, r.childFiles);

        r.childFiles.forEach((child) => {
          log("Storing child file:", {
            tableName: r.tableName,
            templateId: child.templateId,
            filename: child.filename,
          });

          this.store.setGeneratedChildFile(
            r.tableName,
            child.templateId,
            child.code,
            child.filename
          );
        });
      });

    // Debug log after storing
    log("Store state after storing files:", {
      mainFiles: this.store.generatedCodeFiles,
      childFiles: this.store.generatedChildFiles,
    });
  }
}

// Export the main generation function
export async function generateCode(template, tableNames) {
  const generator = new CodeGenerator();
  return generator.generateCode(template, tableNames);
}
