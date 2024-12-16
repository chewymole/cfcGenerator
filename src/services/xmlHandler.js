import { log, error } from "../utils/logger";
import { useDataTypeStore } from "../stores/dataTypeStore";
import { mapSQLType, mapTypeToLanguage } from "../utils/columnUtils";

class XMLResult {
  constructor(success, content = null, error = null) {
    this.success = success;
    this.content = content;
    this.error = error;
  }

  static success(content) {
    return new XMLResult(true, content);
  }

  static failure(error) {
    return new XMLResult(false, null, error);
  }
}

class XMLHandler {
  constructor() {
    this.parser = new DOMParser();
    this.serializer = new XMLSerializer();
  }

  createDocument() {
    return this.parser.parseFromString("<root/>", "text/xml");
  }

  getLanguageDataTypes(language, type) {
    const store = useDataTypeStore();

    // First map the SQL type to our normalized type
    const normalizedType = mapSQLType(type);

    // Then map it to the target language
    return mapTypeToLanguage(normalizedType, "sql", language) || type;
  }

  validateXML(xmlString) {
    try {
      const doc = this.parser.parseFromString(xmlString, "text/xml");
      const parseError = doc.getElementsByTagName("parsererror")[0];

      if (parseError) {
        return XMLResult.failure(`Invalid XML: ${parseError.textContent}`);
      }
      // Test that we can actually find the bean element
      const beanElement = doc.getElementsByTagName("bean")[0];
      log("Found bean element:", beanElement);
      if (!beanElement) {
        return XMLResult.failure(`Invalid Bean: ${beanElement} `);
      }

      return XMLResult.success(doc);
    } catch (err) {
      error("XML validation error:", err);
      return XMLResult.failure(`XML validation failed: ${err.message}`);
    }
  }

  createTableXML(table, model) {
    try {
      const doc = this.createDocument();
      const root = doc.documentElement;

      // Create bean element
      const beanElement = doc.createElement("bean");
      beanElement.setAttribute("name", table.name);
      beanElement.setAttribute("path", table.path || `model.${table.name}`);

      // Create table element
      const tableElement = doc.createElement("dbtable");
      tableElement.setAttribute("name", table.name);
      tableElement.setAttribute("type", model.dbType?.toLowerCase() || "mysql");
      tableElement.setAttribute("dsn", model.dbType || "");

      // Add columns
      table.columns?.forEach((column) => {
        const columnEl = this.createColumnElement(doc, column, model);
        tableElement.appendChild(columnEl);
      });

      // Add relationships if they exist
      if (table.relationships) {
        const relationshipsEl = this.createRelationshipsElement(
          doc,
          table.relationships
        );
        tableElement.appendChild(relationshipsEl);
      }

      beanElement.appendChild(tableElement);
      root.appendChild(beanElement);

      const xmlString = this.serializer.serializeToString(doc);

      log("Generated XML structure:", xmlString);
      log(
        "Primary key columns:",
        table.columns.filter((c) => c.primaryKey)
      );
      log("Sample column data:", table.columns[0]);

      return XMLResult.success(xmlString);
    } catch (err) {
      error("Error creating table XML:", err);
      return XMLResult.failure(`Failed to create table XML: ${err.message}`);
    }
  }

  createColumnElement(doc, column, model) {
    const columnEl = doc.createElement("column");
    // Required attributes
    columnEl.setAttribute("name", column.name);
    const languageType = this.getLanguageDataTypes(
      model.language || "cfml",
      column.type
    );
    columnEl.setAttribute("type", languageType);

    if (model.language === "cfml") {
      // Set cfSqlType based on the column type
      columnEl.setAttribute("cfSqlType", this.mapToCfSqlType(column.type));
    }
    // Set identity
    columnEl.setAttribute("identity", column.identity ? "true" : "false");

    // Set primaryKey (ensure it's "Yes" or "No")
    const isPrimary = column.isPrimaryKey || column.primaryKey;
    columnEl.setAttribute("primaryKey", isPrimary ? "Yes" : "No");

    // Set required (ensure only one instance)
    columnEl.setAttribute("required", column.required ? "Yes" : "No");

    // Set length if available
    if (column.length) {
      columnEl.setAttribute("length", column.length.toString());
    }

    if (column.autoIncrement) {
      columnEl.setAttribute("autoIncrement", "true");
    }
    if (column.foreignKey) {
      columnEl.setAttribute("foreignKey", "true");
      columnEl.setAttribute("foreignTable", column.foreignTable);
      columnEl.setAttribute("foreignColumn", column.foreignColumn);
    }

    return columnEl;
  }

  // Helper function to map SQL types to CF SQL types
  mapToCfSqlType(type) {
    const mapping = {
      string: "cf_sql_varchar",
      integer: "cf_sql_integer",
      numeric: "cf_sql_numeric",
      datetime: "cf_sql_date",
      bit: "cf_sql_bit",
      text: "cf_sql_longvarchar",
      // Add more mappings as needed
    };
    return mapping[type.toLowerCase()] || "cf_sql_varchar";
  }

  createRelationshipsElement(doc, relationships) {
    const relationshipsEl = doc.createElement("relationships");

    relationships.forEach((rel) => {
      const relEl = doc.createElement("relationship");
      relEl.setAttribute("type", rel.type);
      relEl.setAttribute("table", rel.table);
      relEl.setAttribute("column", rel.column);
      relEl.setAttribute("foreignColumn", rel.foreignColumn);

      if (rel.alias) {
        relEl.setAttribute("alias", rel.alias);
      }

      relationshipsEl.appendChild(relEl);
    });

    return relationshipsEl;
  }

  findTableInXML(tablesXML, tableName) {
    try {
      if (!tablesXML) {
        return XMLResult.failure("No tables XML provided");
      }

      // Handle array of XML strings
      if (Array.isArray(tablesXML)) {
        for (const xmlString of tablesXML) {
          const result = this.validateXML(xmlString);
          if (!result.success) continue;

          const doc = result.content;
          const beanElement = doc.getElementsByTagName("bean")[0];

          if (beanElement && beanElement.getAttribute("name") === tableName) {
            return XMLResult.success(xmlString);
          }
        }
      }
      // Handle single XML string
      else if (typeof tablesXML === "string") {
        const result = this.validateXML(tablesXML);
        if (!result.success) {
          return result;
        }

        const doc = result.content;
        const beanElement = doc.getElementsByTagName("bean")[0];

        if (beanElement && beanElement.getAttribute("name") === tableName) {
          return XMLResult.success(tablesXML);
        }
      }

      return XMLResult.failure(`Table ${tableName} not found in XML`);
    } catch (err) {
      error("Error finding table in XML:", err);
      return XMLResult.failure(`Failed to find table: ${err.message}`);
    }
  }

  transformXML(xmlString, xsltProcessor) {
    try {
      const result = this.validateXML(xmlString.replace(/[\r\n\t]/g, ""));
      if (!result.success) {
        return result;
      }

      const fragment = xsltProcessor.transformToFragment(
        result.content,
        document
      );
      if (!fragment || !fragment.textContent.trim()) {
        log("XML String to transform: ", xsltProcessor);
        return XMLResult.failure("Transformation produced no content");
      }

      return XMLResult.success(fragment.textContent.trim());
    } catch (err) {
      error("Error transforming XML:", err);
      return XMLResult.failure(`XML transformation failed: ${err.message}`);
    }
  }
}

export { XMLHandler, XMLResult };
