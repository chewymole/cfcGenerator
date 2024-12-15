import axios from "axios";
import { useGeneratorStore } from "../stores/generatorStore";
import { log, error as logError } from "../utils/logger";
import { APP_CONFIG } from "@config/appConfig";

const API_BASE_URL = APP_CONFIG.API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // This is important for CORS with credentials
});

export const fetchDataSources = async () => {
  try {
    const response = await api.get("/datasources");
    return response.data;
  } catch (error) {
    logError("Error fetching data sources:", error);
    throw error;
  }
};

export const fetchTables = async (datasourceName) => {
  log("fetchTables called with datasourceName:", datasourceName);
  const store = useGeneratorStore();
  try {
    const response = await api.get("/tables", {
      params: { datasourceName },
    });
    log("fetchTables raw response:", response.data);

    if (response.data && response.data.tables) {
      const result = response.data;

      // Store the result in the store
      store.setSelectedTables(result.tables);
      store.setTablesXML(response.data.tableXML);

      // Cache the tableXML after successful fetch
      store.cacheDatasourceTables(datasourceName, response.data.tableXML);

      return result;
    } else {
      throw new Error("Unexpected response format");
    }
  } catch (error) {
    logError("Error in fetchTables:", error);
    return {
      success: false,
      message: error.message || "An error occurred while fetching tables",
    };
  }
};

function parseXMLResponse(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");

  log("Parsed XML:", xmlDoc);

  const tableNodes = xmlDoc.getElementsByTagName("table");
  log("Table nodes:", tableNodes);

  const tables = Array.from(tableNodes).map((node) =>
    node.getAttribute("name")
  );

  log("Extracted tables:", tables);

  return {
    success: true,
    tables: tables,
  };
}

export const generateCode = async (template, tables) => {
  log("generateCode called with template:", template, "and tables:", tables);
  try {
    const response = await api.post("/generate", { template, tables });
    log("generateCode response:", response.data);
    return {
      success: true,
      code: response.data.generatedCode,
    };
  } catch (error) {
    logError("Error in generateCode:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "An error occurred while generating code",
    };
  }
};

export const validateDataSource = async (datasourceName) => {
  try {
    const response = await api.post("/datasources", { datasourceName });
    return response.data;
  } catch (error) {
    logError("Error validating data source:", error);
    throw error;
  }
};
