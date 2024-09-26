import { xsltProcess } from "xslt-processor";

export function generateXMLFromTables(tables) {
  let xml = "<database>";
  tables.forEach((table) => {
    xml += `<table name="${table.name}">`;
    table.columns.forEach((column) => {
      xml += `<column name="${column.name}" type="${column.type}"/>`;
    });
    xml += "</table>";
  });
  xml += "</database>";
  return xml;
}

export function transformXML(xmlContent, xslContent) {
  const resultDocument = xsltProcess(xmlContent, xslContent);
  return resultDocument.toString();
}
