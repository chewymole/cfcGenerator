import { useGeneratorStore } from "../stores/generatorStore";

const parseXml = (xmlString) => {
  const parser = new DOMParser();
  return parser.parseFromString(xmlString, "text/xml");
};

function extractTemplates(xmlDoc) {
  const templates = [];
  const generatorElement = xmlDoc.getElementsByTagName("generator")[0];

  if (generatorElement) {
    const componentNodes = generatorElement.children;
    for (let i = 0; i < componentNodes.length; i++) {
      const node = componentNodes[i];
      const componentName = node.tagName;
      if (componentName) {
        templates.push({
          name: componentName,
          displayName: node.getAttribute("fileNameAppend") || componentName,
          type: node.getAttribute("fileType") || "cfc",
          description:
            node.getElementsByTagName("description")[0]?.textContent || "",
          style: node.getAttribute("style") || "tag",
          includes: Array.from(node.getElementsByTagName("include")).map(
            (include) => include.getAttribute("file")
          ),
        });
      }
    }
  }

  return templates;
}

export async function loadTemplates() {
  const store = useGeneratorStore();

  try {
    //const response = await fetch("./xsl/yac.xml");
    const baseUrl = window.APP_CONFIG?.BASE_URL || "/";
    const response = await fetch(`${baseUrl}xsl/yac.xml`);
    if (!response.ok) {
      throw new Error(`Failed to fetch YAC XML file: ${response.statusText}`);
    }
    const yacXml = await response.text();
    const xmlDoc = parseXml(yacXml);
    const templates = extractTemplates(xmlDoc);

    // Store templates in the Vue store
    store.setTemplates(templates);

    console.log("Templates loaded and stored:", templates);
    return templates;
  } catch (error) {
    console.error("Error loading templates:", error);
    throw error;
  }
}

export function getAvailableTemplates() {
  const store = useGeneratorStore();
  return store.getTemplates();
}
