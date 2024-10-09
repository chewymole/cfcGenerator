import { useGeneratorStore } from "../stores/generatorStore";
import { log, error } from "../utils/logger";

async function fetchXSLContent(filename) {
  log(`Fetching XSL content for: ${filename}`);
  const baseUrl = window.APP_CONFIG?.BASE_URL || "/";
  try {
    // Use a relative path from the root of the public directory
    const response = await fetch(`${baseUrl}xsl/${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const content = await response.text();
    log("XSL Content", content);
    // Check if the content looks like XSL
    if (content.includes("<!DOCTYPE html>")) {
      throw new Error("Content does not appear to be a valid XSL file");
    }

    log(`Successfully fetched XSL content for ${filename}`);
    return content;
  } catch (err) {
    error(`Error fetching XSL file ${filename}:`, err);
    throw new Error(`Failed to fetch XSL file ${filename}: ${err.message}`);
  }
}

function decodeXSLContent(content) {
  return content
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

async function processXSL(template, includes, templatePath) {
  try {
    const wrapperXSL = await fetchXSLContent(`${template}`, templatePath);
    const decodedWrapperXSL = wrapperXSL;

    let innerFunctions = "";
    for (const include of includes) {
      try {
        const innerXSL = await fetchXSLContent(include, templatePath);
        innerFunctions += innerXSL;
      } catch (err) {
        error(`Error processing include ${include}:`, err);
        // You might want to throw this error or handle it differently
      }
    }

    const processedXSL = decodedWrapperXSL.replace(
      "<!-- custom code -->",
      innerFunctions
    );
    log("Processed XSL:", processedXSL);
    return processedXSL;
  } catch (err) {
    error("Error processing XSL:", err);
    throw err;
  }
}

export async function generateCode(template, tables, tablesXML) {
  log("Generating code for template:", template, "and tables:", tables);
  log("Tables XML:", tablesXML);

  const store = useGeneratorStore();

  try {
    const baseUrl = window.APP_CONFIG?.BASE_URL || "/";
    const templatePath = `${baseUrl}xsl/`; //store.getTemplatePath();
    const includes = store.getIncludes();

    const xslContentRaw = await processXSL(
      template.name,
      includes,
      templatePath
    );

    const parser = new DOMParser();
    const xslDoc = parser.parseFromString(xslContentRaw, "text/xml");
    log("xslDoc parsed:", xslDoc);

    const xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(xslDoc);

    const generatedCodeFiles = [];
    for (const table of tables) {
      const tableXML = findTableInXML(tablesXML, table);
      if (tableXML) {
        log("tableXML before:", tableXML);
        const cleanedXmlString = tableXML.replace(/[\r\n\t]/g, "");

        const tableDoc = parser.parseFromString(cleanedXmlString, "text/xml");
        log("tableDoc parsed:", tableDoc);

        const resultFragment = xsltProcessor.transformToFragment(
          tableDoc,
          document
        );
        if (resultFragment) {
          const generatedCode = resultFragment.textContent.trim();
          if (generatedCode) {
            generatedCodeFiles.push({
              tableName: table,
              code: generatedCode,
            });
          }
        }
      }
    }
    store.setGeneratedCodeFiles(generatedCodeFiles);
    return generatedCodeFiles;
  } catch (err) {
    error("Error during code generation:", err);
    throw err;
  }
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function findTableInXML(tablesXML, table) {
  // Iterate through the array of XML strings to find the matching table
  for (const xmlString of tablesXML) {
    // Parse the current XML string into a DOM object
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    // Get the first <bean> element
    const beanElement = xmlDoc.getElementsByTagName("bean")[0];

    // Ensure the bean element exists and get the 'name' attribute
    if (beanElement) {
      const currentTableName = beanElement.getAttribute("name"); // Get the 'name' attribute

      // Check if the current table name matches the input table name
      if (currentTableName === table) {
        return xmlString; // Return the matching XML string
      }
    }
  }

  return null; // Return null if no match is found
}
