import { log, error } from "../utils/logger";
import { APP_CONFIG } from "@config/appConfig";

export class TemplateResult {
  constructor(success, content = null, error = null) {
    this.success = success;
    this.content = content;
    this.error = error;
  }

  static success(content) {
    return new TemplateResult(true, content);
  }

  static failure(error) {
    return new TemplateResult(false, null, error);
  }
}

export class TemplateProcessor {
  constructor(baseUrl = APP_CONFIG.BASE_URL || "/") {
    this.baseUrl = baseUrl;
    this.templatePath = `${baseUrl}xsl/`;
    this.cache = new Map();
  }

  async fetchTemplate(filename) {
    try {
      // Check cache first
      if (this.cache.has(filename)) {
        return TemplateResult.success(this.cache.get(filename));
      }

      const response = await fetch(`${this.templatePath}${filename}`);
      if (!response.ok) {
        return TemplateResult.failure(`HTTP error! status: ${response.status}`);
      }

      const content = await response.text();
      if (content.includes("<!DOCTYPE html>")) {
        return TemplateResult.failure(
          "Content does not appear to be a valid XSL file"
        );
      }

      // Cache the result
      this.cache.set(filename, content);
      return TemplateResult.success(content);
    } catch (err) {
      error(`Error fetching template ${filename}:`, err);
      return TemplateResult.failure(`Failed to fetch template: ${err.message}`);
    }
  }

  async processTemplate(template, includes = []) {
    try {
      log("Processing template with includes:", { template, includes });

      // Fetch main template
      const mainResult = await this.fetchTemplate(template);
      if (!mainResult.success) {
        return mainResult;
      }

      // Process includes in parallel
      const includeResults = await Promise.all(
        includes.map((include) => this.fetchTemplate(include))
      );

      // Check for any failed includes
      const failedIncludes = includeResults.filter((result) => !result.success);
      if (failedIncludes.length > 0) {
        const errors = failedIncludes.map((result) => result.error).join("; ");
        return TemplateResult.failure(`Failed to process includes: ${errors}`);
      }

      // Combine all includes
      const combinedIncludes = includeResults
        .map((result) => result.content)
        .join("\n");

      // Insert includes into main template
      const processedTemplate = mainResult.content.replace(
        "<!-- custom code -->",
        combinedIncludes
      );

      return TemplateResult.success(processedTemplate);
    } catch (err) {
      error("Error processing template:", err);
      return TemplateResult.failure(
        `Failed to process template: ${err.message}`
      );
    }
  }

  createProcessor(xslContent) {
    try {
      const parser = new DOMParser();
      const xslDoc = parser.parseFromString(xslContent, "text/xml");

      // Check for parsing errors
      const parseError = xslDoc.getElementsByTagName("parsererror")[0];
      if (parseError) {
        return TemplateResult.failure(
          `XML parsing error: ${parseError.textContent}`
        );
      }

      const processor = new XSLTProcessor();
      processor.importStylesheet(xslDoc);

      return TemplateResult.success(processor);
    } catch (err) {
      error("Error creating XSL processor:", err);
      return TemplateResult.failure(
        `Failed to create XSL processor: ${err.message}`
      );
    }
  }

  clearCache() {
    this.cache.clear();
    log("Template cache cleared");
  }

  getCacheSize() {
    return this.cache.size;
  }

  isCached(filename) {
    return this.cache.has(filename);
  }
}
