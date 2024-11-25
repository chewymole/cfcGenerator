export const DATA_TYPES = {
  Common: [
    {
      value: "string",
      label: "String",
      description: "Variable-length character string",
    },
    { value: "integer", label: "Integer", description: "Whole number value" },
    {
      value: "decimal",
      label: "Decimal",
      description: "Decimal number with fixed precision",
    },
    { value: "bit", label: "Boolean", description: "True/False value" },
    { value: "date", label: "Date", description: "Date without time" },
    { value: "datetime", label: "DateTime", description: "Date and time" },
  ],
  Text: [
    { value: "text", label: "Text", description: "Large text content" },
    {
      value: "char",
      label: "Char",
      description: "Fixed-length character string",
    },
  ],
  Numbers: [
    {
      value: "bigint",
      label: "Big Integer",
      description: "Large whole number",
    },
    { value: "float", label: "Float", description: "Floating-point number" },
    {
      value: "smallint",
      label: "Small Integer",
      description: "Small whole number",
    },
  ],
};

export const DEFAULT_LENGTHS = {
  // Text types
  string: 255,
  char: 1,
  nvarchar: 255,
  binary: 50,
  varbinary: 50,

  // Numeric types
  tinyint: 1,
  smallint: 2,
  integer: 4,
  bigint: 8,
  decimal: 18,
  float: 8,
  real: 4,
  money: 8,

  // Date/Time types
  date: 3,
  datetime: 8,
  timestamp: 8,
  time: 3,

  // Other types
  boolean: 1,
  guid: 16,

  // Types that don't need length
  text: null,
  longtext: null,
  ntext: null,
  xml: null,
  json: null,
  blob: null,
};

export function getDefaultValuePlaceholder(type) {
  switch (type) {
    case "string":
    case "char":
    case "nvarchar":
    case "text":
      return "'text'";
    case "integer":
    case "bigint":
    case "smallint":
    case "tinyint":
      return "0";
    case "decimal":
    case "float":
    case "real":
    case "money":
      return "0.00";
    case "boolean":
      return "false";
    case "date":
    case "datetime":
      return "GETDATE()";
    case "guid":
      return "NEWID()";
    default:
      return "Default value";
  }
}

// Add SQL type mapping
export const SQL_TYPE_MAPPING = {
  // Integer types
  int: "integer",
  bigint: "bigint",
  smallint: "smallint",
  tinyint: "tinyint",
  numeric: "integer",

  // String types
  varchar: "string",
  nvarchar: "nvarchar",
  char: "char",
  nchar: "char",
  text: "text",
  ntext: "ntext",
  string: "varchar",

  // Decimal types
  decimal: "decimal",
  money: "money",
  float: "float",
  real: "real",

  // Date/Time types
  date: "date",
  datetime: "datetime",
  datetime2: "datetime",
  timestamp: "timestamp",
  time: "time",

  // Boolean type
  bit: "boolean",
  boolean: "bit",

  // Other types
  uniqueidentifier: "guid",
  xml: "xml",
  json: "json",
  binary: "binary",
  varbinary: "varbinary",
  image: "blob",
};

export function mapSQLType(sqlType) {
  // Remove length specification and lowercase
  const baseType = sqlType.split("(")[0].toLowerCase();

  // Get mapped type or return original if no mapping exists
  const mappedType = SQL_TYPE_MAPPING[baseType];
  if (!mappedType) {
    console.warn(`No mapping found for SQL type: ${sqlType}`);
    return baseType;
  }

  return mappedType;
}

// Function to extract length from SQL type
export function extractLength(sqlType) {
  const matches = sqlType.match(/\((\d+)\)/);
  return matches ? parseInt(matches[1]) : null;
}

export function getMappedType(type, dbType) {
  return TYPE_MAPPINGS[dbType]?.[type] || type.toUpperCase();
}

export const LANGUAGE_TO_SQL_TYPES = {
  cfml: {
    string: "VARCHAR,CHAR,NVARCHAR,TEXT,LONGTEXT",
    numeric: "INT,TINYINT,INTEGER,BIGINT,DECIMAL,MONEY,FLOAT,REAL",
    boolean: "BIT",
    date: "DATE,DATETIME,TIMESTAMP",
  },
  JavaScript: {
    string: "VARCHAR,CHAR,NVARCHAR,TEXT,LONGTEXT,NTEXT",
    // Split number into more specific types for better SQL mapping
    integer: "INT,INTEGER,BIGINT,SMALLINT,TINYINT",
    float: "FLOAT,DECIMAL,NUMERIC,REAL,DOUBLE",
    boolean: "BIT,BOOLEAN",
    Date: "DATETIME,TIMESTAMP,DATE,TIME",
  },
  TypeScript: {
    string: "VARCHAR,CHAR,NVARCHAR,TEXT,NTEXT",
    number: "DECIMAL,NUMERIC,DOUBLE",
    integer: "INT,INTEGER,BIGINT,SMALLINT,TINYINT",
    float: "FLOAT,REAL",
    boolean: "BIT,BOOLEAN",
    Date: "DATETIME,TIMESTAMP,DATE,TIME",
    any: "JSON,JSONB",
    unknown: "BLOB,BINARY",
    Array: "JSON,JSONB",
    Object: "JSON,JSONB",
  },
  Python: {
    str: "VARCHAR,CHAR,NVARCHAR,TEXT",
    int: "INT,INTEGER,BIGINT,SMALLINT,TINYINT",
    float: "FLOAT,REAL,DOUBLE,DECIMAL,NUMERIC",
    bool: "BIT,BOOLEAN",
    datetime: "DATETIME,TIMESTAMP",
    date: "DATE",
    time: "TIME",
    dict: "JSON,JSONB",
    list: "JSON,JSONB",
    bytes: "BLOB,BINARY,VARBINARY",
    None: "NULL",
  },
  DotNet: {
    String: "VARCHAR,CHAR,NVARCHAR,TEXT",
    Int32: "INT,INTEGER",
    Int16: "SMALLINT",
    Int64: "BIGINT",
    Byte: "TINYINT",
    Double: "FLOAT,DOUBLE",
    Decimal: "DECIMAL,NUMERIC",
    Single: "REAL",
    Boolean: "BIT,BOOLEAN",
    DateTime: "DATETIME,DATETIME2",
    DateTimeOffset: "DATETIMEOFFSET",
    TimeSpan: "TIME",
    Guid: "UNIQUEIDENTIFIER",
    ByteArray: "BINARY,VARBINARY,IMAGE",
    Object: "SQL_VARIANT",
  },
  PHP: {
    string: "VARCHAR,CHAR,NVARCHAR,NCHAR",
    int: "INT,INTEGER,SMALLINT,TINYINT",
    float: "FLOAT,REAL",
    double: "DOUBLE,DECIMAL,NUMERIC",
    bool: "BIT,BOOLEAN",
    DateTime: "DATETIME,TIMESTAMP,DATE,TIME",
    array: "JSON,JSONB",
    text: "TEXT,NTEXT,MEDIUMTEXT",
    longText: "LONGTEXT",
  },
  Laravel: {
    string: "VARCHAR,CHAR,NVARCHAR,NCHAR",
    integer: "INT,INTEGER,BIGINT,SMALLINT,TINYINT",
    float: "FLOAT,REAL",
    double: "DOUBLE,DECIMAL,NUMERIC",
    boolean: "BIT,BOOLEAN",
    datetime: "DATETIME,TIMESTAMP,DATE,TIME",
    json: "JSON,JSONB",
    text: "TEXT,NTEXT,MEDIUMTEXT",
    longText: "LONGTEXT",
  },
};

export function getActualSQLType(type, language = "cfml") {
  return LANGUAGE_TO_SQL_TYPES[language]?.[type] || type.toUpperCase();
}

export const LANGUAGE_DATA_TYPES = {
  cfml: {
    Common: [
      { value: "string", label: "String", description: "CF: String type" },
      { value: "numeric", label: "Numeric", description: "CF: Numeric type" },
      { value: "boolean", label: "Boolean", description: "CF: Boolean type" },
      { value: "date", label: "Date", description: "CF: Date type" },
      {
        value: "timestamp",
        label: "Timestamp",
        description: "CF: Timestamp type",
      },
    ],
    Text: [
      {
        value: "string",
        label: "Text",
        description: "CF: String type for large text",
      },
    ],
  },
  JavaScript: {
    Common: [
      { value: "string", label: "String", description: "JS: string type" },
      { value: "number", label: "Number", description: "JS: number type" },
      { value: "boolean", label: "Boolean", description: "JS: boolean type" },
      { value: "Date", label: "Date", description: "JS: Date object" },
    ],
    Text: [
      {
        value: "string",
        label: "Text",
        description: "JS: string type for large text",
      },
    ],
  },
  Laravel: {
    Common: [
      { value: "string", label: "String", description: "PHP: string type" },
      { value: "integer", label: "Integer", description: "PHP: integer type" },
      { value: "float", label: "Float", description: "PHP: float type" },
      { value: "boolean", label: "Boolean", description: "PHP: boolean type" },
      {
        value: "datetime",
        label: "DateTime",
        description: "PHP: DateTime object",
      },
    ],
    Text: [
      {
        value: "text",
        label: "Text",
        description: "PHP: text type for large text",
      },
      {
        value: "longtext",
        label: "Long Text",
        description: "PHP: longtext type for very large text",
      },
    ],
  },
};

// Update the language selector options to match yac.xml
const SUPPORTED_LANGUAGES = [
  { value: "cfml", label: "ColdFusion" },
  { value: "JavaScript", label: "JavaScript" },
  { value: "Laravel", label: "Laravel (PHP)" },
];

export function getDataTypesForLanguage(language = "cfml") {
  return LANGUAGE_DATA_TYPES[language] || LANGUAGE_DATA_TYPES.cfml;
}

// Update type mapping function to use the same keys
export function mapTypeToLanguage(type, fromLanguage, toLanguage) {
  const typeMap = {
    cfml: {
      string: { JavaScript: "string", Laravel: "string" },
      numeric: { JavaScript: "number", Laravel: "integer" },
      boolean: { JavaScript: "boolean", Laravel: "boolean" },
      date: { JavaScript: "Date", Laravel: "datetime" },
      timestamp: { JavaScript: "Date", Laravel: "datetime" },
    },
    JavaScript: {
      string: { cfml: "string", Laravel: "string" },
      number: { cfml: "numeric", Laravel: "integer" },
      boolean: { cfml: "boolean", Laravel: "boolean" },
      Date: { cfml: "timestamp", Laravel: "datetime" },
    },
    Laravel: {
      string: { cfml: "string", JavaScript: "string" },
      integer: { cfml: "numeric", JavaScript: "number" },
      float: { cfml: "numeric", JavaScript: "number" },
      boolean: { cfml: "boolean", JavaScript: "boolean" },
      datetime: { cfml: "timestamp", JavaScript: "Date" },
      text: { cfml: "string", JavaScript: "string" },
      longtext: { cfml: "string", JavaScript: "string" },
    },
  };

  return typeMap[fromLanguage]?.[type]?.[toLanguage] || type;
}
