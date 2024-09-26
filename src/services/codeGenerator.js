import { useGeneratorStore } from "../stores/generatorStore";
import { getXSLFilePath } from "../services/xslService";
import { saveAs } from "file-saver";

/*
function saveContent(content, filename) {
  var blob = new Blob([`${content}`], { type: "text/plain;charset=utf-8" });
  FileSaver.saveAs(blob, filename);
}
*/

async function fetchXSLContent(filename) {
  /*
  const filePath = getXSLFilePath(filename);
  if (!filePath) {
    console.error(
      `XSL file not found: ${filename} for template ` //${templateType}
    );
    throw new Error(`XSL file not found: ${filename}`);
  }
  */

  console.log(`Fetching XSL content for: ${filename}`);

  try {
    const response = await fetch(`/public/xsl/${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const content = await response.text();
    console.log("XSL Content", content);
    // Check if the content looks like XSL
    if (!content.includes("xsl:")) {
      throw new Error("Content does not appear to be a valid XSL file");
    }

    console.log(`Successfully fetched XSL content for ${filename}`);
    return content;
  } catch (error) {
    console.error(`Error fetching XSL file ${filename}:`, error);
    throw new Error(`Failed to fetch XSL file ${filename}: ${error.message}`);
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
    const wrapperXSL = await fetchXSLContent(`${template}.xsl`, templatePath);
    const decodedWrapperXSL = wrapperXSL; // decodeXSLContent(wrapperXSL);

    let innerFunctions = "";
    for (const include of includes) {
      try {
        const innerXSL = await fetchXSLContent(include, templatePath);
        //innerFunctions += decodeXSLContent(innerXSL);
        innerFunctions += innerXSL;
      } catch (error) {
        console.error(`Error processing include ${include}:`, error);
        // You might want to throw this error or handle it differently
      }
    }

    const processedXSL = decodedWrapperXSL.replace(
      "<!-- custom code -->",
      innerFunctions
    );
    console.log("Processed XSL:", processedXSL);
    return processedXSL;
  } catch (error) {
    console.error("Error processing XSL:", error);
    throw error;
  }
}

export async function generateCode(template, tables, tablesXML) {
  console.log("Generating code for template:", template, "and tables:", tables);
  console.log("Tables XML:", tablesXML);

  const store = useGeneratorStore();

  try {
    const templatePath = "/xsl/"; //store.getTemplatePath();
    const includes = store.getIncludes();

    const xslContentRaw = await processXSL(
      template.name,
      includes,
      templatePath
    );

    // Create an XSLT processor
    const parser = new DOMParser();
    const xslDoc = parser.parseFromString(xslContentRaw, "text/xml");
    console.log("xslDoc parsed:", xslDoc);
    //const xslContent = decodeXSLContent(xslDoc);

    const xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(xslDoc);

    //pick out the selected tables from the tablesXML
    // loop over the array of selected tables, and find that table in the xml

    const generatedCodeFiles = [];
    for (const table of tables) {
      const tableXML = findTableInXML(tablesXML, table); // tablesXML.find(t => t.name === table);
      if (tableXML) {
        console.log("tableXML before:", tableXML);
        const cleanedXmlString = tableXML.replace(/[\r\n\t]/g, "");

        const tableDoc = parser.parseFromString(cleanedXmlString, "text/xml");
        console.log("tableDoc parsed:", tableDoc);

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

    /*
    // Parse the tables XML
    const xmlDoc = parser.parseFromString(tablesXML, "text/xml");
    console.log("xmlDoc parsed:", xmlDoc);
    // Apply the transformation
    const resultFragment = xsltProcessor.transformToFragment(xmlDoc, document);

    if (resultFragment) {
      console.log("Raw transformation result:", resultFragment);
      const generatedCode = resultFragment.textContent.trim();
      if (generatedCode) {
        console.log("Trimmed transformation result:", generatedCode);
        return generatedCode;
      } else {
        console.error(
          "Transformation resulted in empty content after trimming"
        );
        throw new Error(
          "Transformation resulted in empty content after trimming"
        );
      }
    } else {
      console.error("Transformation resulted in null fragment");
      throw new Error("Transformation resulted in null fragment");
    }
    */
  } catch (error) {
    console.error("Error during code generation:", error);
    throw error;
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
