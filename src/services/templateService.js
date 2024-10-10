import { useGeneratorStore } from "../stores/generatorStore";

const parseXml = (xmlString) => {
  const parser = new DOMParser();
  return parser.parseFromString(xmlString, "text/xml");
};

function extractTemplates(xmlDoc) {
  const templates = [];
  const rootElement = xmlDoc.getElementsByTagName("generator")[0];

  if (rootElement) {
    const categoryNodes = rootElement.children;
    for (let i = 0; i < categoryNodes.length; i++) {
      const categoryNode = categoryNodes[i];
      const categoryName = categoryNode.getAttribute("name");
      const categoryIcon = categoryNode.getAttribute("icon");
      const subcategoryNodes = categoryNode.children;
      for (let j = 0; j < subcategoryNodes.length; j++) {
        const subcategoryNode = subcategoryNodes[j];
        const subcategoryName = subcategoryNode.getAttribute("name");

        const templateNodes = subcategoryNode.children;
        for (let k = 0; k < templateNodes.length; k++) {
          const templateNode = templateNodes[k];
          const templateName = templateNode.getAttribute("template");
          if (templateName) {
            templates.push({
              name: templateName,
              displayName: templateNode.getAttribute("name") || templateName,
              type: templateNode.getAttribute("filetype") || "txt",
              language: templateNode.getAttribute("language") || "any",
              category: categoryName || "Uncategorized",
              categoryIcon: categoryIcon || "default",
              subcategory: subcategoryName || "Uncategorized",
              description:
                templateNode.getElementsByTagName("description")[0]
                  ?.textContent || "",
              style: templateNode.getAttribute("style") || "tag",
              includes: Array.from(
                templateNode.getElementsByTagName("include")
              ).map((include) => include.getAttribute("file")),
            });
          }
        }
      }

      // if (categoryName) {
      //   templates.push({
      //     name: componentName,
      //     displayName: node.getAttribute("fileNameAppend") || componentName,
      //     type: node.getAttribute("fileType") || "cfc",
      //     language: node.getAttribute("language") || "cfml",
      //     description:
      //       node.getElementsByTagName("description")[0]?.textContent || "",
      //     style: node.getAttribute("style") || "tag",
      //     includes: Array.from(node.getElementsByTagName("include")).map(
      //       (include) => include.getAttribute("file")
      //     ),
      //   });
      // }

      /*
        const templates = result.generator.map((node) => ({
            name: node.$.template,
            displayName: node.$.fileNameAppend,
            fileType: node.$.fileType,
            style: node.$.style,
            language: node.$.language,
            description: node.description ? node.description[0] : "",
            includes: node.include ? node.include.map((inc) => inc.$.file) : [],
          }));
      */
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
