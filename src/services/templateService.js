import { useGeneratorStore } from "../stores/generatorStore";
import { log, error } from "../utils/logger";
import { TemplateValidator } from "./templateValidator";
import { fileManager } from "./fileManager";

const parseXml = (xmlString) => {
  const parser = new DOMParser();
  return parser.parseFromString(xmlString, "text/xml");
};

function parseTemplates(xmlDoc) {
  const templates = [];
  const templateNodes = xmlDoc.getElementsByTagName("template");

  for (let i = 0; i < templateNodes.length; i++) {
    const templateNode = templateNodes[i];
    if (templateNode.parentElement.tagName === "children") continue;

    const category = templateNode.closest("category");
    const subcategory = templateNode.closest("subcategory");

    // Only process if template has an ID
    const templateId = templateNode.getAttribute("id");
    if (templateId) {
      const compatibilityNode =
        templateNode.getElementsByTagName("compatibility")[0];
      const sourceTypes =
        compatibilityNode
          ?.getElementsByTagName("sourceType")[0]
          ?.textContent?.split(",") || [];

      const language =
        compatibilityNode?.getElementsByTagName("language")[0]?.textContent ||
        "";

      const template = {
        id: templateId,
        name: templateNode.getAttribute("name"),
        filetype: templateNode.getAttribute("filetype") || "txt",
        style: templateNode.getAttribute("style") || "tag",
        language: language,
        template: templateNode.getAttribute("template"),
        category: category ? category.getAttribute("name") : "Uncategorized",
        categoryIcon: category ? category.getAttribute("icon") : "default",
        subcategory: subcategory
          ? subcategory.getAttribute("name")
          : "Uncategorized",
        description:
          templateNode.getElementsByTagName("description")[0]?.textContent ||
          "",

        supportsModel:
          sourceTypes.length === 0 || sourceTypes.includes("model"),
        supportsDatasource:
          sourceTypes.length === 0 || sourceTypes.includes("datasource"),

        // Parse includes
        includes: Array.from(templateNode.getElementsByTagName("include")).map(
          (include) => include.getAttribute("file")
        ),

        // Parse children templates
        children: Array.from(
          templateNode
            .getElementsByTagName("children")?.[0]
            ?.getElementsByTagName("template") || []
        ).map((child) => ({
          ref: child.getAttribute("ref"),
          required: child.getAttribute("required") === "true",
        })),
      };

      templates.push(template);
    }
  }

  return templates;
}

async function loadTemplates() {
  const store = useGeneratorStore();

  try {
    // If templates are already loaded, return them
    if (store.getTemplates().length > 0) {
      return {
        success: true,
        templates: store.availableTemplates,
      };
    }

    // Fetch the generator.xml file
    const response = await fetch("/xsl/generator.xml");
    const xmlText = await response.text();

    // Parse XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    // Parse templates
    const templates = parseTemplates(xmlDoc);
    console.log(templates);

    // Validate templates before storing
    const validator = new TemplateValidator(xmlDoc);
    const validationResult = validator.validateAllTemplates();

    if (validationResult.errors.length) {
      return {
        success: false,
        message: "Template validation failed",
        errors: validationResult.errors,
      };
    }

    // Store templates if validation passed
    store.setTemplates(templates);

    return {
      success: true,
      templates: store.availableTemplates,
    };
  } catch (error) {
    log("Error fetching templates:", error);
    return {
      success: false,
      message: error.message || "An error occurred while fetching templates",
    };
  }
}

class TemplateFileService {
  static async loadTemplateContent(templatePath) {
    try {
      log("Loading template content:", templatePath);
      const result = await fileManager.readFile(templatePath);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    } catch (err) {
      error("Failed to load template content:", err);
      throw err;
    }
  }

  static async loadGeneratorXml() {
    try {
      const result = await fileManager.readFile("/xsl/generator.xml");
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    } catch (err) {
      error("Failed to load generator XML:", err);
      throw err;
    }
  }

  static async saveGeneratorXml(content) {
    try {
      const result = await fileManager.writeFile("/xsl/generator.xml", content);
      if (!result.success) {
        throw new Error(result.error);
      }
      return true;
    } catch (err) {
      error("Failed to save generator XML:", err);
      throw err;
    }
  }

  static async saveTemplateFile(templatePath, content) {
    try {
      const result = await fileManager.writeFile(templatePath, content);
      if (!result.success) {
        throw new Error(result.error);
      }
      return true;
    } catch (err) {
      error("Failed to save template file:", err);
      throw err;
    }
  }
}

export {
  loadTemplates,
  parseTemplates, // if needed elsewhere
  TemplateFileService,
};
