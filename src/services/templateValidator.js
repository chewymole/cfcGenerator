import { log } from "../utils/logger";

export class TemplateValidator {
  constructor(xmlDoc) {
    this.xmlDoc = xmlDoc;
  }

  validateAllTemplates() {
    const errors = [];
    const warnings = [];

    // Get all non-child templates (direct descendants of category/subcategory)
    const rootTemplates = Array.from(
      this.xmlDoc.getElementsByTagName("template")
    ).filter((template) => template.parentElement.tagName !== "children");

    // Validate root templates
    for (let template of rootTemplates) {
      const templateName = template.getAttribute("name") || "Unknown";
      const templateFile = template.getAttribute("template") || "Unknown";

      // Root templates must have an id
      if (!template.getAttribute("id")) {
        errors.push(
          `Template "${templateName}" (file: ${templateFile}) is missing required 'id' attribute`
        );
        continue;
      }

      // Validate child templates if any exist
      const childTemplates =
        template
          .getElementsByTagName("children")[0]
          ?.getElementsByTagName("template") || [];
      for (let childTemplate of childTemplates) {
        // Child templates must have a ref
        if (!childTemplate.getAttribute("ref")) {
          errors.push(
            `Child template under "${templateName}" is missing required 'ref' attribute`
          );
        }
      }
    }

    return { errors, warnings };
  }

  validateTemplate(templateId) {
    const errors = [];
    const warnings = [];

    try {
      const templateNode = this.xmlDoc.querySelector(
        `template[id="${templateId}"]`
      );
      if (!templateNode) {
        errors.push(`Template not found: ${templateId}`);
        return { errors, warnings };
      }

      const templateName = templateNode.getAttribute("name") || templateId;

      // Required attributes check
      if (!templateName) {
        errors.push(`Template ${templateId} missing required 'name' attribute`);
      }

      // Check template content
      const templateContent = templateNode.getAttribute("template");
      if (!templateContent) {
        errors.push(
          `Template ${templateName} (${templateId}) missing template content`
        );
      }

      // Category validation
      const category = templateNode.closest("category");
      if (!category) {
        errors.push(
          `Template ${templateName} (${templateId}) must be within a category`
        );
      } else {
        const categoryName = category.getAttribute("name");
        if (!categoryName) {
          errors.push(
            `Category for template ${templateName} (${templateId}) missing required 'name' attribute`
          );
        }
      }

      // Validate children references
      const children =
        templateNode
          .getElementsByTagName("children")?.[0]
          ?.getElementsByTagName("template") || [];
      for (const child of children) {
        const ref = child.getAttribute("ref");
        if (!ref) {
          errors.push(
            `Child template in ${templateName} (${templateId}) missing required 'ref' attribute`
          );
          continue;
        }

        // Check if referenced template exists
        const refExists = this.xmlDoc.querySelector(`template[id="${ref}"]`);
        if (!refExists) {
          errors.push(
            `Template ${templateName} (${templateId}) references non-existent template "${ref}"`
          );
        }
      }

      // Validate includes
      const includes = templateNode.getElementsByTagName("include");
      for (const include of includes) {
        const file = include.getAttribute("file");
        if (!file) {
          errors.push(
            `Include in template ${templateName} (${templateId}) missing required 'file' attribute`
          );
        } else {
          // File naming convention check
          if (!this.validateFileName(file)) {
            warnings.push(
              `Include file "${file}" in template ${templateName} (${templateId}) may have invalid characters`
            );
          }
        }
      }

      // Validate compatibility if present
      const compatNode = templateNode.getElementsByTagName("compatibility")[0];
      if (compatNode) {
        const language = compatNode.getElementsByTagName("language")[0];
        const dbType = compatNode.getElementsByTagName("dbType")[0];

        if (!language && !dbType) {
          errors.push(
            `Template ${templateName} (${templateId}) has empty compatibility section`
          );
        }

        if (language) {
          const languages =
            language.textContent?.split(",").map((l) => l.trim()) || [];
          if (!this.validateLanguages(languages)) {
            errors.push(
              `Template ${templateName} (${templateId}) has invalid language specifications`
            );
          }
        }

        if (dbType) {
          const dbTypes =
            dbType.textContent?.split(",").map((db) => db.trim()) || [];
          if (!this.validateDbTypes(dbTypes)) {
            errors.push(
              `Template ${templateName} (${templateId}) has invalid database type specifications`
            );
          }
        }
      }

      // Style validation
      const style = templateNode.getAttribute("style");
      if (style && !["tag", "script", "class", "module"].includes(style)) {
        warnings.push(
          `Template ${templateName} (${templateId}) has invalid style attribute: ${style}`
        );
      }

      // Filetype validation
      const filetype = templateNode.getAttribute("filetype");
      if (!filetype) {
        errors.push(
          `Template ${templateName} (${templateId}) missing required 'filetype' attribute`
        );
      }
    } catch (error) {
      errors.push(`Error validating template ${templateId}: ${error.message}`);
    }

    return {
      success: errors.length === 0,
      errors,
      warnings,
    };
  }

  validateFileName(file) {
    // Basic validation: file should be non-empty and have an extension
    if (!file || typeof file !== "string") return false;

    // File should have an extension
    const hasExtension = file.includes(".");

    // File shouldn't contain invalid characters
    const hasInvalidChars = /[<>:"|?*]/.test(file);

    return hasExtension && !hasInvalidChars;
  }

  validateLanguages(languages) {
    const validLanguages = [
      "java",
      "csharp",
      "typescript",
      "javascript",
      "ts",
      "js",
      "py",
      "python",
      "php",
      "cfml",
      "cfc",
      "cfm",
    ];
    return languages.every((lang) =>
      validLanguages.includes(lang.toLowerCase())
    );
  }

  validateDbTypes(dbTypes) {
    const validDbTypes = [
      "mysql",
      "postgresql",
      "sqlserver",
      "oracle",
      "sqlite",
      "mssql",
      "mongo",
    ];
    return dbTypes.every((type) => validDbTypes.includes(type.toLowerCase()));
  }
}
