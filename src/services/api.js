import axios from "axios";
import { useGeneratorStore } from "../stores/generatorStore";

const API_BASE_URL =
  window.APP_CONFIG?.API_URL || import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // This is important for CORS with credentials
});

export const fetchDataSources = async () => {
  try {
    const response = await api.get("/datasources");
    return response.data;
  } catch (error) {
    console.error("Error fetching data sources:", error);
    throw error;
  }
};

export const fetchTables = async (datasourceName) => {
  console.log("fetchTables called with datasourceName:", datasourceName);
  const store = useGeneratorStore();
  try {
    const response = await api.get("/tables", {
      params: { datasourceName },
    });
    console.log("fetchTables raw response:", response.data);

    if (response.data && response.data.tables) {
      const result = response.data;

      // Store the result in the store
      store.setSelectedTables(result.tables);
      store.setTablesXML(response.data.tableXML);

      return result;
    } else {
      throw new Error("Unexpected response format");
    }
  } catch (error) {
    console.error("Error in fetchTables:", error);
    return {
      success: false,
      message: error.message || "An error occurred while fetching tables",
    };
  }
};

function parseXMLResponse(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");

  console.log("Parsed XML:", xmlDoc);

  const tableNodes = xmlDoc.getElementsByTagName("table");
  console.log("Table nodes:", tableNodes);

  const tables = Array.from(tableNodes).map((node) =>
    node.getAttribute("name")
  );

  console.log("Extracted tables:", tables);

  return {
    success: true,
    tables: tables,
  };
}

export const generateCode = async (template, tables) => {
  console.log(
    "generateCode called with template:",
    template,
    "and tables:",
    tables
  );
  try {
    const response = await api.post("/generate", { template, tables });
    console.log("generateCode response:", response.data);
    return {
      success: true,
      code: response.data.generatedCode,
    };
  } catch (error) {
    console.error("Error in generateCode:", error);
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
    console.error("Error validating data source:", error);
    throw error;
  }
};
