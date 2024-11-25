export function convertModelToXML(model) {
  console.log("Converting model:", model); // Debug log

  if (!model) {
    throw new Error("Model is undefined or null");
  }

  // Check the actual structure
  if (!Array.isArray(model.tables)) {
    throw new Error("Model must have a 'tables' array property");
  }

  const doc = document.implementation.createDocument(null, "root", null);

  // Create the bean element
  const bean = doc.createElement("bean");
  bean.setAttribute("name", model.name);
  bean.setAttribute("path", `model.${model.name}`);

  // Add each table
  model.tables.forEach((table) => {
    const dbtable = doc.createElement("dbtable");
    dbtable.setAttribute("name", table.name);
    dbtable.setAttribute("type", "mysql"); // or get from table properties
    dbtable.setAttribute("dsn", "test"); // or get from table properties

    table.columns.forEach((column) => {
      const columnEl = doc.createElement("column");

      // Set basic attributes
      columnEl.setAttribute("name", column.name);
      columnEl.setAttribute("type", column.type);

      // Set cfSqlType based on the column type
      columnEl.setAttribute("cfSqlType", mapToCfSqlType(column.type));

      // Set identity
      columnEl.setAttribute("identity", column.identity ? "true" : "false");

      // Set primaryKey (ensure it's "Yes" or "No")
      columnEl.setAttribute("primaryKey", column.primaryKey ? "Yes" : "No");

      // Set required (ensure only one instance)
      columnEl.setAttribute("required", column.required ? "Yes" : "No");

      // Set length if available
      if (column.length) {
        columnEl.setAttribute("length", column.length.toString());
      }

      dbtable.appendChild(columnEl);
    });

    bean.appendChild(dbtable);
  });

  doc.documentElement.appendChild(bean);

  // Convert to string
  const serializer = new XMLSerializer();
  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' +
    serializer.serializeToString(doc)
  );

  //   // Add relationships if they exist
  //   if (table.relationships && Array.isArray(table.relationships)) {
  //     table.relationships.forEach((rel) => {
  //       xml += `    <Relationship`;
  //       xml += ` ForeignTable="${rel.targetTable}"`;
  //       xml += ` ForeignColumn="${rel.targetColumn}"`;
  //       xml += ` Type="${rel.type}"`; // OneToOne, OneToMany, etc.
  //       xml += " />\n";
  //     });
  //   }

  //   xml += "  </dbtable>\n";
  // });

  // xml += "</bean></root>";
  // console.log("Generated XML:", xml); // Debug log
  // return xml;
}

// Helper function to map SQL types to CF SQL types
function mapToCfSqlType(type) {
  const mapping = {
    string: "cf_sql_varchar",
    integer: "cf_sql_integer",
    numeric: "cf_sql_numeric",
    datetime: "cf_sql_timestamp",
    bit: "cf_sql_bit",
    text: "cf_sql_longvarchar",
    // Add more mappings as needed
  };
  return mapping[type.toLowerCase()] || "cf_sql_varchar";
}
