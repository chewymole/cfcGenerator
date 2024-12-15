import { useDataTypeStore } from "../stores/dataTypeStore";

// Utility function to extract length from SQL type string
export function extractLength(sqlType) {
  const matches = sqlType.match(/\((\d+)\)/);
  return matches ? parseInt(matches[1]) : null;
}

// Map SQL type to our normalized type
export function mapSQLType(sqlType) {
  const store = useDataTypeStore();
  const baseType = sqlType.split("(")[0].toLowerCase();

  // First check if it's already a normalized type
  if (store.languageMappings.sql[baseType]) {
    return store.languageMappings.sql[baseType];
  }

  // If not, search through all base types to find matching SQL type
  for (const [type, config] of Object.entries(store.baseTypes)) {
    if (config.sqlTypes.some((sql) => sql.toLowerCase() === baseType)) {
      return type;
    }
  }

  console.warn(`No mapping found for SQL type: ${sqlType}`);
  return baseType;
}

// Map type between languages
export function mapTypeToLanguage(type, fromLanguage, toLanguage) {
  const store = useDataTypeStore();
  const fromMapping = store.languageMappings[fromLanguage];
  const toMapping = store.languageMappings[toLanguage];

  if (!fromMapping || !toMapping) {
    console.warn(`Invalid language mapping: ${fromLanguage} -> ${toLanguage}`);
    return type;
  }

  // Find the base type(s) for the source language type
  let baseTypes = [];
  for (const [langType, baseType] of Object.entries(fromMapping)) {
    if (langType === type) {
      baseTypes = Array.isArray(baseType) ? baseType : [baseType];
      break;
    }
  }

  // Find the matching type in the target language
  for (const [langType, baseType] of Object.entries(toMapping)) {
    const targetTypes = Array.isArray(baseType) ? baseType : [baseType];
    if (baseTypes.some((t) => targetTypes.includes(t))) {
      return langType;
    }
  }

  return type;
}

// Get actual SQL type for a given language type
export function getActualSQLType(type, language = "cfml") {
  const store = useDataTypeStore();
  const baseType = store.languageMappings[language]?.[type];

  if (!baseType) return type.toUpperCase();

  const targetType = Array.isArray(baseType) ? baseType[0] : baseType;
  return store.getSQLTypes(targetType)[0] || type.toUpperCase();
}

// Get default value placeholder
export function getDefaultValuePlaceholder(type) {
  const store = useDataTypeStore();
  return store.getDefaultValue(type) || "Default value";
}

export function getDefaultLength(type) {
  const store = useDataTypeStore();
  return store.getDefaultLength(type) || "1";
}

export function getAvailableTypes() {
  const store = useDataTypeStore();
  return store.baseTypes;
}
