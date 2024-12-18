<template>
  <div class="space-y-4">
    <!-- Table Form -->
    <div class="border p-4 rounded">
      <h4 class="font-semibold mb-4">
        Add Table
      </h4>

      <div class="space-y-4">
        <!-- Path and Database Type -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block mb-1">Path</label>
            <input
              v-model="newTable.path"
              type="text"
              class="w-full px-4 py-2 border rounded"
              placeholder="e.g., Admin/Users"
            >
          </div>
          <div>
            <label class="block mb-1">Database Type</label>
            <select
              v-model="newTable.dbType"
              class="w-full px-4 py-2 border rounded"
            >
              <option value="MSSQL">
                SQL Server
              </option>
              <option value="MySQL">
                MySQL
              </option>
              <option value="PostgreSQL">
                PostgreSQL
              </option>
              <option value="Oracle">
                Oracle
              </option>
              <option value="SQLite">
                SQLite
              </option>
            </select>
          </div>
        </div>

        <div>
          <label class="block mb-1">Table Name</label>
          <input
            v-model="newTable.name"
            type="text"
            class="w-full px-4 py-2 border rounded"
          >
        </div>

        <!-- Columns -->
        <div>
          <label class="block mb-1">Columns</label>
          <div class="space-y-2">
            <div
              v-for="(column, index) in newTable.columns"
              :key="index"
              class="flex space-x-2"
            >
              <input
                :ref="
                  (el) => {
                    if (index === newTable.columns.length - 1)
                      lastColumnInput = el;
                  }
                "
                v-model="column.name"
                type="text"
                class="flex-1 px-4 py-2 border rounded"
                placeholder="Column name"
              >
              <!-- 
              <select
                  v-model="column.type"
                  class="px-4 py-2 border rounded"
                  @change="handleTypeChange(column)"
                >
                
                <optgroup label="Common">
                  <option value="string">String/VARCHAR</option>
                  <option value="integer">Integer</option>
                  <option value="decimal">Decimal</option>
                  <option value="boolean">BIT/Boolean</option>
                  <option value="date">Date</option>
                  <option value="datetime">DateTime</option>
                </optgroup>
                
                <optgroup label="Text">
                  <option value="char">CHAR</option>
                  <option value="text">TEXT</option>
                  <option value="longtext">LONGTEXT</option>
                  <option value="nvarchar">NVARCHAR</option>
                  <option value="ntext">NTEXT</option>
                </optgroup>
                
                <optgroup label="Numeric">
                  <option value="tinyint">TINYINT</option>
                  <option value="smallint">SMALLINT</option>
                  <option value="bigint">BIGINT</option>
                  <option value="float">FLOAT</option>
                  <option value="real">REAL</option>
                  <option value="money">MONEY</option>
                </optgroup>
                
                <optgroup label="Binary">
                  <option value="binary">BINARY</option>
                  <option value="varbinary">VARBINARY</option>
                  <option value="blob">BLOB</option>
                </optgroup>
                
                <optgroup label="Other">
                  <option value="guid">GUID</option>
                  <option value="xml">XML</option>
                  <option value="json">JSON</option>
                  <option value="time">TIME</option>
                  <option value="timestamp">TIMESTAMP</option>
                </optgroup>
              </select> 
            -->

              <select
                v-model="column.type"
                :value="column.type || ''"
                class="col-span-2 px-2 py-1 border rounded hover:border-gray-400 focus:border-blue-500 focus:outline-none"
                @change="(e) => handleTypeChange(column, e.target.value)"
              >
                <option value="" disabled>
                  Select a type
                </option>
                <optgroup
                  v-for="(types, category) in availableTypes"
                  :key="category"
                  :label="category"
                >
                  <option
                    v-for="type in types"
                    :key="type.label"
                    :value="type.label.toLowerCase() || ''"
                  >
                    {{ type.label || "" }}
                  </option>
                </optgroup>
              </select>

              <!-- Only show length for string/text types -->
              <input
                v-if="showLengthFor(column.type)"
                v-model="column.length"
                type="number"
                class="w-24 px-4 py-2 border rounded"
                placeholder="Length"
              >

              <div class="flex space-x-2">
                <label class="flex items-center space-x-1">
                  <input
                    v-model="column.isPrimaryKey"
                    type="checkbox"
                    class="form-checkbox"
                    @change="handlePrimaryKeyChange(column)"
                  >
                  <span class="text-sm">PK</span>
                </label>

                <label class="flex items-center space-x-1">
                  <input
                    v-model="column.isNullable"
                    type="checkbox"
                    :disabled="column.isPrimaryKey"
                    class="form-checkbox"
                    @change="handleNullableChange(column)"
                  >
                  <span class="text-sm">Nullable</span>
                </label>
              </div>

              <!-- Default Value input -->
              <div
                v-if="!column.isNullable && !column.isPrimaryKey"
                class="flex-1"
              >
                <input
                  v-model="column.defaultValue"
                  type="text"
                  class="w-full px-4 py-2 border rounded"
                  :placeholder="getDefaultValuePlaceholder(column.type)"
                >
              </div>

              <button
                class="px-4 py-2 border rounded"
                @click="removeColumn(index)"
              >
                Remove
              </button>
            </div>
          </div>
          <button class="mt-2 px-4 py-2 border rounded" @click="addColumn">
            Add Column
          </button>
        </div>
      </div>

      <button
        class="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        :disabled="!canAddTable"
        @click="addTable"
      >
        Add Table
      </button>
    </div>

    <!-- Table List -->
    <div v-if="tables.length" class="space-y-4">
      <h4 class="font-semibold">
        Created Tables
      </h4>
      <div class="grid grid-cols-2 gap-4">
        <div
          v-for="table in tables"
          :key="table.name"
          class="p-4 border rounded"
        >
          <h5 class="font-semibold mb-2">
            {{ table.name }}
          </h5>
          <div class="text-sm space-y-1">
            <div v-for="column in table.columns" :key="column.name">
              {{ column.name }}: {{ column.type }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from "vue";
import { useDataTypeStore } from "../../../stores/dataTypeStore";
import { getDefaultValuePlaceholder } from "../../../utils/columnUtils";

const emit = defineEmits(["tables-loaded"]);
const lastColumnInput = ref(null);

const dataTypeStore = useDataTypeStore();
const tables = ref([]);
const newTable = ref({
  name: "",
  path: "",
  dbType: "MSSQL",
  columns: [
    {
      name: "",
      type: "varchar",
      length: null,
      isPrimaryKey: false,
      isNullable: true,
      defaultValue: null,
    },
  ],
});

function showLengthFor(type) {
  // Only show length for types that need it
  return [
    "string",
    "char",
    "nvarchar",
    "binary",
    "varbinary",
    "decimal",
  ].includes(type);
}
// Use SQL types from our config
const availableTypes = computed(() => {
  // Get SQL types from our store/config
  const sqlMappings = dataTypeStore.languageMappings.sql;

  // Group the types by category
  const groupedTypes = {
    "Numeric Types": [],
    "String Types": [],
    "Date/Time Types": [],
    "Other Types": [],
  };

  // Categorize each SQL type
  Object.entries(sqlMappings).forEach(([type]) => {
    const typeInfo = dataTypeStore.getTypeInfo(type);

    if (typeInfo) {
      switch (typeInfo.category) {
        case "numeric":
          groupedTypes["Numeric Types"].push(typeInfo);
          break;
        case "string":
          groupedTypes["String Types"].push(typeInfo);
          break;
        case "datetime":
          groupedTypes["Date/Time Types"].push(typeInfo);
          break;
        default:
          groupedTypes["Other Types"].push(typeInfo);
      }
    }
  });

  // Remove empty categories
  return Object.fromEntries(
    Object.entries(groupedTypes).filter(([_, types]) => types.length > 0)
  );
});

function handleTypeChange(column) {
  // Set default length based on type
  column.length = dataTypeStore.getDefaultLength(column.type);
  // DEFAULT_LENGTHS[column.type];

  // Special handling for specific types
  if (column.type === "guid") {
    column.length = null; // GUIDs have fixed length
  }

  // Suggest primary key for ID-like columns
  if (
    (column.type === "integer" || column.type === "bigint") &&
    (column.name.toLowerCase().includes("id") ||
      column.name.toLowerCase().includes("key")) &&
    newTable.value.columns.every((col) => !col.isPrimaryKey)
  ) {
    column.isPrimaryKey = true;
    column.isNullable = false;
  }

  // Force non-nullable for primary keys
  if (column.isPrimaryKey) {
    column.isNullable = false;
  }

  // Reset default value when type changes
  if (column.defaultValue !== null) {
    switch (column.type) {
      case "integer":
      case "bigint":
      case "smallint":
      case "tinyint":
      case "int":
        column.defaultValue = !isNaN(column.defaultValue)
          ? column.defaultValue
          : "0";
        break;
      case "decimal":
      case "float":
      case "real":
      case "money":
        column.defaultValue = !isNaN(column.defaultValue)
          ? column.defaultValue
          : "0.00";
        break;
      case "boolean":
      case "bit":
        column.defaultValue = column.defaultValue === "true" ? "true" : "false";
        break;
      case "date":
      case "datetime":
        column.defaultValue = "GETDATE()";
        break;
      case "guid":
        column.defaultValue = "NEWID()";
        break;
      default:
        if (typeof column.defaultValue !== "string") {
          column.defaultValue = "";
        }
    }
  }
}

// Handle primary key changes
function handlePrimaryKeyChange(column) {
  if (column.isPrimaryKey) {
    column.isNullable = false;
    column.defaultValue = null; // Clear default value for PKs
  }
}

// Handle nullable changes
function handleNullableChange(column) {
  if (column.isNullable) {
    column.defaultValue = null; // Clear default value if column becomes nullable
  }
}

const canAddTable = computed(() => {
  return (
    newTable.value.name &&
    newTable.value.columns.length > 0 &&
    newTable.value.columns.every((col) => col.name) &&
    newTable.value.columns.some((col) => col.isPrimaryKey) // Require at least one PK
  );
});

async function addColumn() {
  newTable.value.columns.push({
    name: "",
    type: "varchar",
    length: dataTypeStore.getDefaultLength("varchar"),
    isPrimaryKey: false,
    isNullable: true,
    defaultValue: null,
  });

  // Focus the new column's name input after render
  await nextTick();
  if (lastColumnInput.value) {
    lastColumnInput.value.focus();
  }
}

function removeColumn(index) {
  newTable.value.columns.splice(index, 1);
}

function addTable() {
  if (canAddTable.value) {
    const tableToAdd = {
      ...newTable.value,
      columns: [...newTable.value.columns],
      path: newTable.value.path.trim(),
      dbType: newTable.value.dbType,
    };

    tables.value.push(tableToAdd);
    emit("tables-loaded", tables.value);

    // Reset form
    newTable.value = {
      name: "",
      path: "",
      dbType: newTable.value.dbType, // Keep the same DB type for convenience
      columns: [
        {
          name: "",
          type: "varchar",
          length: dataTypeStore.getDefaultLength("varchar"),
          isPrimaryKey: false,
          isNullable: true,
          defaultValue: null,
        },
      ],
    };
  }
}
</script>
