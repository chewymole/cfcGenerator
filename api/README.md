# ColdFusion API for Code Generator

This folder contains the ColdFusion API for the Code Generator project using Taffy.io.

## Running the API locally

1. Ensure you have CommandBox installed.
2. Open a terminal and navigate to this `/api` folder.
3. Run the following command to start the server:

   ```
   box server start
   ```

4. The API will be available at `http://localhost:8080/api`.

## API Endpoints

- GET /api/datasources - Fetch available data sources
- GET /api/tables?dataSource={dataSourceName} - Fetch tables for a given data source
- GET /api/templates - Fetch available templates
- POST /api/generate - Generate code based on selected data source, tables, and template
