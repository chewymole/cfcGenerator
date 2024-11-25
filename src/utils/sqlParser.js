import { Parser } from "node-sql-parser";
import { DEFAULT_LENGTHS, mapSQLType } from "./columnUtils";

export function detectDBMS(sqlContent) {
  const sql = sqlContent.toLowerCase();

  if (sql.includes("auto_increment")) {
    return { type: "mysql", ast: true };
  } else if (sql.includes("identity")) {
    return { type: "tsql", ast: true };
  } else if (sql.includes("serial")) {
    return { type: "postgresql", ast: true };
  } else if (sql.includes("autoincrement")) {
    return { type: "sqlite", ast: true };
  }

  return { type: "mysql", ast: true };
}

function cleanMSSQLSyntax(sql) {
  // First, remove everything before CREATE TABLE
  const createTablePart = sql.substring(sql.indexOf("CREATE TABLE"));

  // Get the CREATE TABLE statement with schema
  const createMatch = createTablePart.match(
    /CREATE\s+TABLE\s+\[(?:\w+)\]\.\[(\w+)\]\s*\(([\s\S]+?)(?:\)\s*ON\s*\[PRIMARY\](?:\s*TEXTIMAGE_ON\s*\[PRIMARY\])?)/im
  );

  if (!createMatch) {
    throw new Error("Could not parse CREATE TABLE statement");
  }

  const tableName = createMatch[1];
  let columnsAndConstraints = createMatch[2];

  // Pre-process the entire string to handle multi-line issues
  columnsAndConstraints = columnsAndConstraints
    .replace(/IDENTITY\s*\(\s*1\s*,\s*\n?\s*1\s*\)/gi, "AUTO_INCREMENT")
    .replace(/\[([^\]]+)\]/g, "$1")
    .replace(/varchar\s*\(\s*max\s*\)/gi, "text")
    .replace(/\bbit\b/gi, "tinyint(1)");

  // Find the primary key column
  const pkMatch = columnsAndConstraints.match(
    /CONSTRAINT\s+PK_\w+\s+PRIMARY\s+KEY[^(]*\(\s*(\w+)\s+ASC\s*\)/i
  );
  const primaryKeyColumn = pkMatch ? pkMatch[1] : null;

  // Process column definitions
  const processedColumns = columnsAndConstraints
    .split(",")
    .map((line) => {
      line = line.trim();

      // Skip constraints and table options
      if (
        line.toUpperCase().includes("CONSTRAINT") ||
        line.includes("PAD_INDEX") ||
        line.includes("STATISTICS_NORECOMPUTE") ||
        line.includes("IGNORE_DUP_KEY") ||
        line.includes("ALLOW_ROW_LOCKS") ||
        line.includes("ALLOW_PAGE_LOCKS") ||
        line.includes("FILLFACTOR")
      ) {
        return "";
      }

      return line.trim();
    })
    .filter(Boolean); // Remove empty lines

  // Add the primary key constraint at the end
  if (primaryKeyColumn) {
    processedColumns.push(`PRIMARY KEY (${primaryKeyColumn})`);
  }

  // Build the final CREATE TABLE statement
  return `CREATE TABLE ${tableName} (${processedColumns.join(",\n")})`;
}

export function parseSQLToTables(sqlContent) {
  try {
    const dbType = detectDBMS(sqlContent);

    // Clean up MSSQL syntax if needed
    const cleanSQL =
      dbType.type === "tsql" ? cleanMSSQLSyntax(sqlContent) : sqlContent;

    const parser = new Parser();
    const result = parser.parse(cleanSQL, {
      ...dbType,
      type: dbType.type === "tsql" ? "mysql" : dbType.type,
    });

    // Get statements from the ast property
    const statements = Array.isArray(result.ast) ? result.ast : [result.ast];

    // Filter for CREATE TABLE statements
    const createStatements = statements.filter(
      (stmt) => stmt.type === "create" && stmt.keyword === "table"
    );

    if (!createStatements.length) {
      throw new Error("No CREATE TABLE statements found");
    }

    return createStatements
      .map((stmt) => ({
        name: stmt.table[0].table,
        columns: stmt.create_definitions
          .filter((def) => def.resource === "column")
          .map((def) => {
            const type = mapSQLType(def.definition.dataType.toLowerCase());

            return {
              name: def.column.column,
              type,
              length: def.definition.length || DEFAULT_LENGTHS[type],
              isPrimaryKey: false,
              isNullable: !def.nullable || def.nullable.type !== "not null",
              defaultValue: def.default_val?.value?.value || null,
              isAutoIncrement: !!def.auto_increment,
              isUnique: false,
            };
          }),
      }))
      .map((table) => {
        // Process constraints after all columns are created
        const stmt = createStatements.find(
          (s) => s.table[0].table === table.name
        );

        // Find primary key and unique constraints
        stmt.create_definitions
          .filter((def) => def.resource === "constraint")
          .forEach((constraint) => {
            const columns = constraint.definition.map((d) => d.column);

            if (constraint.constraint_type === "primary key") {
              table.columns.forEach((col) => {
                if (columns.includes(col.name)) {
                  col.isPrimaryKey = true;
                  col.isNullable = false;
                }
              });
            }

            if (constraint.constraint_type === "unique key") {
              table.columns.forEach((col) => {
                if (columns.includes(col.name)) {
                  col.isUnique = true;
                }
              });
            }
          });

        return table;
      });
  } catch (error) {
    throw new Error(`Failed to parse SQL: ${error.message}`);
  }
}

// Helper function to validate the parsed tables
export function validateParsedTables(tables) {
  const errors = [];

  if (!tables || !tables.length) {
    errors.push("No tables found in SQL");
    return errors;
  }

  tables.forEach((table, tableIndex) => {
    if (!table.name) {
      errors.push(`Table ${tableIndex + 1} is missing a name`);
    }

    if (!table.columns?.length) {
      errors.push(`Table "${table.name || tableIndex + 1}" has no columns`);
    }

    table.columns?.forEach((column, colIndex) => {
      if (!column.name) {
        errors.push(
          `Column ${colIndex + 1} in table "${table.name}" is missing a name`
        );
      }
      if (!column.type) {
        errors.push(
          `Column "${column.name}" in table "${table.name}" is missing a type`
        );
      }
    });

    // Check for primary key
    if (!table.columns?.some((col) => col.isPrimaryKey)) {
      errors.push(
        `Table "${table.name}" must have at least one primary key column`
      );
    }
  });

  return errors;
}
