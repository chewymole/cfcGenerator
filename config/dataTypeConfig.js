// Supported languages configuration, update later when you add your types below
export const SUPPORTED_LANGUAGES = [
  { value: "cfml", label: "ColdFusion", icon: "/icons/file_type_cfm.svg" },
  {
    value: "JavaScript",
    label: "JavaScript",
    icon: "/icons/file_type_js.svg",
  },
  {
    value: "Laravel",
    label: "Laravel (PHP)",
    icon: "/icons/file_type_php.svg",
  },
  {
    value: "TypeScript",
    label: "TypeScript",
    icon: "/icons/file_type_js.svg",
  },
  { value: "Python", label: "Python", icon: "/icons/file_type_python.svg" },
  { value: "Java", label: "Java", icon: "/icons/file_type_java.svg" },
  { value: "C#", label: "C#", icon: "/icons/file_type_cfm.svg" },
  { value: "C++", label: "C++", icon: "/icons/file_type_cfm.svg" },
  { value: "Go", label: "Go", icon: "/icons/file_type_go.svg" },
  { value: "Rust", label: "Rust", icon: "/icons/file_type_rust.svg" },
  { value: "Swift", label: "Swift", icon: "/icons/file_type_cfm.svg" },
  { value: "Kotlin", label: "Kotlin", icon: "/icons/file_type_kotlin.svg" },
  { value: "PHP", label: "PHP", icon: "/icons/file_type_php.svg" },
  { value: "Rust", label: "Rust", icon: "/icons/file_type_cfm.svg" },
  { value: "Scala", label: "Scala", icon: "/icons/file_type_cfm.svg" },
  { value: "vue", label: "VueJS", icon: "/icons/file_type_vue.svg" },
];

export const SUPPORTED_DATABASES = [
  { value: "mssql", label: "Microsoft SQL Server" },
  { value: "mysql", label: "MySQL" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "sqlite", label: "SQLite" },
  { value: "oracle", label: "Oracle" },
  { value: "mongodb", label: "MongoDB" },
  { value: "cassandra", label: "Cassandra" },
  { value: "redis", label: "Redis" },
  { value: "dynamodb", label: "DynamoDB" },
  { value: "snowflake", label: "Snowflake" },
  { value: "redshift", label: "Redshift" },
];

export const TEMPLATE_STYLES = [
  { id: "class", name: "Class" },
  { id: "model", name: "Model" },
  { id: "component", name: "Component" },
  { id: "controller", name: "Controller" },
  { id: "repository", name: "Repository" },
  { id: "service", name: "Service" },
  { id: "tag", name: "Tag" },
  { id: "script", name: "Script" },
];

export const TEMPLATE_CATEGORIES = [
  { id: "backend", name: "Backend" },
  { id: "frontend", name: "Frontend" },
  { id: "database", name: "Database" },
];

// Base data types with their properties
export const BASE_DATA_TYPES = {
  string: {
    label: "String",
    description: "Variable-length character string",
    defaultLength: 255,
    category: "Common",
    sqlTypes: ["VARCHAR", "CHAR", "NVARCHAR", "TEXT"],
    defaultValue: "'text'",
  },
  integer: {
    label: "Integer",
    description: "Whole number value",
    defaultLength: 4,
    category: "Common",
    sqlTypes: ["INT", "INTEGER", "BIGINT", "SMALLINT", "TINYINT"],
    defaultValue: "0",
  },
  int: {
    label: "Integer",
    description: "Whole number value",
    defaultLength: 4,
    category: "Common",
    sqlTypes: ["INT", "INTEGER", "BIGINT", "SMALLINT", "TINYINT"],
    defaultValue: "0",
  },
  decimal: {
    label: "Decimal",
    description: "Decimal number with fixed precision",
    defaultLength: 18,
    category: "Common",
    sqlTypes: ["DECIMAL", "NUMERIC", "MONEY", "FLOAT", "REAL"],
    defaultValue: "0.00",
  },
  boolean: {
    label: "Boolean",
    description: "True/False value",
    defaultLength: 1,
    category: "Common",
    sqlTypes: ["BIT", "BOOLEAN"],
    defaultValue: "false",
  },
  date: {
    label: "Date",
    description: "Date without time",
    defaultLength: 3,
    category: "Common",
    sqlTypes: ["DATE"],
    defaultValue: "GETDATE()",
  },
  datetime: {
    label: "DateTime",
    description: "Date and time",
    defaultLength: 8,
    category: "Common",
    sqlTypes: ["DATETIME", "TIMESTAMP"],
    defaultValue: "GETDATE()",
  },
  text: {
    label: "Text",
    description: "Large text content",
    defaultLength: null,
    category: "Text",
    sqlTypes: ["TEXT", "LONGTEXT", "NTEXT"],
    defaultValue: "'text'",
  },
  guid: {
    label: "GUID",
    description: "Globally unique identifier",
    defaultLength: 16,
    category: "Other",
    sqlTypes: ["UNIQUEIDENTIFIER"],
    defaultValue: "NEWID()",
  },
};

// Language-specific type mappings
export const LANGUAGE_MAPPINGS = {
  sql: {
    // SQL to normalized type mappings
    // Already normalized types (pass-through)
    string: "string",
    integer: "integer",
    decimal: "decimal",
    boolean: "boolean",
    datetime: "datetime",
    date: "date",
    text: "text",
    // SQL specific types to normalized types
    varchar: "string",
    char: "string",
    text: "text",
    nvarchar: "string",
    ntext: "text",
    int: "integer",
    bigint: "integer",
    smallint: "integer",
    tinyint: "integer",
    numeric: "decimal",
    float: "decimal",
    double: "decimal",
    bit: "boolean",
    datetime: "datetime",
    date: "date",
    timestamp: "datetime",
    // ... add other SQL types as needed
  },
  cfml: {
    string: ["varchar", "nvarchar", "char", "text"],
    numeric: ["int", "integer", "decimal", "float"],
    boolean: ["boolean", "bit"],
    date: ["date", "datetime"],
  },
  JavaScript: {
    string: "string",
    number: ["integer", "decimal", "float"],
    boolean: "boolean",
    Date: ["date", "datetime"],
  },
  TypeScript: {
    string: "string",
    number: ["decimal", "float"],
    integer: "integer",
    boolean: "boolean",
    Date: ["date", "datetime"],
    any: ["json", "blob"],
    unknown: ["blob", "binary"],
  },
  Laravel: {
    string: "string",
    integer: "integer",
    float: ["decimal", "float"],
    boolean: "boolean",
    datetime: ["date", "datetime"],
    text: "text",
  },
};

export const SQL_TYPE_INFO = {
  // Numeric Types
  int: {
    category: "numeric",
    label: "INT",
    description: "Integer type",
    defaultLength: 4,
  },
  tinyint: {
    category: "numeric",
    label: "TINYINT",
    description: "Small integer type",
    defaultLength: 1,
  },
  bigint: {
    category: "numeric",
    label: "BIGINT",
    description: "Large integer type",
    defaultLength: 8,
  },
  decimal: {
    category: "numeric",
    label: "DECIMAL",
    description: "Fixed-point number",
    defaultLength: "18,2",
  },
  float: {
    category: "numeric",
    label: "FLOAT",
    description: "Floating-point number",
    defaultLength: 4,
  },
  double: {
    category: "numeric",
    label: "DOUBLE",
    description: "Double Floating-point number",
    defaultLength: 8,
  },
  smallint: {
    category: "numeric",
    label: "SMALLINT",
    description: "Small integer type",
    defaultLength: 2,
  },

  // String Types
  char: {
    category: "string",
    label: "CHAR",
    description: "Fixed-length string",
    defaultLength: 1,
  },
  nvarchar: {
    category: "string",
    label: "NVARCHAR",
    description: "Variable-length string with Unicode support",
    defaultLength: 255,
  },
  text: {
    category: "string",
    label: "TEXT",
    description: "Large variable-length string",
    defaultLength: null,
  },
  varchar: {
    category: "string",
    label: "VARCHAR",
    description: "Variable-length string",
    defaultLength: 255,
  },

  // Date/Time Types
  datetime: {
    category: "datetime",
    label: "DATETIME",
    description: "Date and time",
    defaultLength: 8,
  },
  date: {
    category: "datetime",
    label: "DATE",
    description: "Date",
    defaultLength: 3,
  },
  time: {
    category: "datetime",
    label: "TIME",
    description: "Time",
    defaultLength: 3,
  },
  timestamp: {
    category: "datetime",
    label: "TIMESTAMP",
    description: "Timestamp",
    defaultLength: 4,
  },

  // Other Types
  bit: {
    category: "other",
    label: "BIT",
    description: "Boolean type",
    defaultLength: 1,
  },
  uniqueidentifier: {
    category: "other",
    label: "UNIQUEIDENTIFIER",
    description: "Unique identifier",
    defaultLength: 16,
  },
  xml: {
    category: "other",
    label: "XML",
    description: "XML data type",
    defaultLength: null,
  },
};
