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

## Troubleshooting

- You may need to add a mapping to /taffy in your Lucee or ACF admin if you get some errors trying to access the dashboard. This can happen if you are setting this up in a sub-directory under the web root.
- Depending on your web server, you may need to allow the .xsl file extention to be served by the server. For example:

  ```
  server set web.allowedExt=xsl
  ```
