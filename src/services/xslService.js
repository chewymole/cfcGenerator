import { ref } from "vue";
import { useGeneratorStore } from "../stores/generatorStore";
const xslFileMap = ref({});

export async function scanXSLFiles() {
  const store = useGeneratorStore();

  try {
    const baseUrl = window.APP_CONFIG?.BASE_URL || "/";
    const response = await fetch(`${baseUrl}xsl/yac.xml`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    const templates = [];
    const generatorElement = xmlDoc.getElementsByTagName("generator")[0];

    if (generatorElement) {
      const componentNodes = generatorElement.children;
      for (let i = 0; i < componentNodes.length; i++) {
        const node = componentNodes[i];
        const componentName = node.tagName;
        const fileNameAppend =
          node.getAttribute("fileNameAppend") || componentName;
        const fileType = node.getAttribute("fileType") || "cfc";

        templates.push({
          name: componentName,
          displayName: fileNameAppend,
          type: fileType,
          includes: Array.from(node.getElementsByTagName("include")).map(
            (include) => include.getAttribute("file")
          ),
        });

        // Build the file map for easy access
        xslFileMap.value[componentName] = {
          displayName: fileNameAppend,
          type: fileType,
          includes: templates[templates.length - 1].includes,
        };
      }
    }

    // Store templates in the Vue store
    store.setTemplates(templates);
  } catch (error) {
    console.error("Error scanning XSL files:", error);
    throw error;
  }
}

export function getXSLFilePath(filename) {
  scanXSLFiles();
  return xslFileMap.value.length || null;
}

export function getAllXSLFiles() {
  return xslFileMap.value;
}
