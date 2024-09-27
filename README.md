# CFC Generator / API Generator AKA Illudium PU-36 Code Generator v2

```
  _____________________
 |  _________________  |
 | | CFC Generator   | |
 | |_________________| |
 |  ___ ___ ___   ___  |
 | | 7 | 8 | 9 | | + | |
 | |___|___|___| |___| |
 | | 4 | 5 | 6 | | - | |
 | |___|___|___| |___| |
 | | 1 | 2 | 3 | | x | |
 | |___|___|___| |___| |
 | | . | 0 | = | | / | |
 | |___|___|___| |___| |
 |_____________________|
```

## Ported from: [CFC Generator](https://github.com/deanlaw/cfcgenerator)

This is my first real VueJS project, so please don't judge me too harshly. I welcome any suggestions!

This project is a Vue 3 front-end with a ColdFusion / Lucee backend and a Taffy.io API that generates ColdFusion code. The origial project was created by [deanlaw](https://github.com/deanlaw) that used Flash as a frontend, it also required you to have the ColdFusion / Lucee Admin password to generate the code. This version has a Vue 3 frontend and a Taffy.io API that generates ColdFusion code. It does not require the ColdFusion / Lucee Admin password to generate the code. But you must have a valid Datasource configured on your server you plan to generate the code on and you must know the Datasource name.

One of the awesome parts from Dean's original project is that he used XSL style-sheets to generate the resulting code. I have ported his original code to use xml2js and xslt-processor to generate the resulting code on the client side within the VueJS application. This allows you to generate the code on your local machine and arrange the paths and folders how you like, then copy the generated code into your project and or server..

### Improvements:

I improved the yac.XML file that describes the XSL templates, I added a Name, Description, and syntax style attributes. These are displayed in the UI to help you identify the template you want to use.

I removed some of the older template types, and added an ORM template to generate the code for CF ORM code in both Tag and Script syntax and added a Taffy API template to generate an API based on the selected tables. I have also added CF side caching to the table list per datasource name, generating the code will be faster and not require the server side admin password.

### Note:

I had to add top 200 in the SQL that grabs the table names. The server I am testing with has several thousand tables and it was taking too long to generate the list. 200 was a happy medium for me to still be able to select the datasource and see the list of tables in a reasonable amount of time. If your server has less than 200 tables, you can remove the top 200 in the SQL and it will grab all the tables. But if you are like me and have a ton, you may want to add some filtering to allow you to grab by schema or table prefixes.

### Other features:

These templates are easy to modify to your liking, and you are not limited to using this for ColdFusion, you can use it for any language that you want, just make the new templates and style-sheets.

### API:

I have included a [Taffy.io](https://taffy.io/) API that is preconfigured, and can connect to any datasource configured in your Coldfusion/Lucee Server, given you know the Datasource name. You can use this API or you can use what ever API you want to generate the Table XML and datasource name validation, just modify the .env and config.js files to point to your API. The defualt is:

```
API_BASE_URL=http://localhost:8080/api/index.cfm?endpoint=
```

The API only has 2 endpoints:

`GET: /tables`
Will return all the tables in the selected datasource as a structure:

```JSON
{
  "success": true,
  "tableXML": [
    "<xml.....",
    "<xml.....",
    "<xml....."
  ],
  "tables": [
    "table1",
    "table2",
    "table3"
  ]
}
```

![tables endpoint](./public/images/tables-endpoint.png)
![tables endpoint](./public/images/tables-endpoint-result.png)

`POST: /datasource`
Will return true if the given datasource name is valid and exists.

```JSON
{
  "message": "Datasource validated successfully",
  "success": true
}
```

![ds endpoint](./public/images/datasource-endpoint.png)
![ds endpoint](./public/images/datasource-endpoint-result.png)

## Table of Contents

- [CFC Generator / API Generator AKA Illudium PU-36 Code Generator v2](#cfc-generator--api-generator-aka-illudium-pu-36-code-generator-v2)
- [Note:](#note)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Languages](#languages)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
    - [Frontend (Vue 3)](#frontend-vue-3)
    - [Backend (ColdFusion / Lucee)](#backend-coldfusion--lucee)
  - [Usage](#usage)
  - [Contributing](#contributing)
  - [License](#license)
  - [References](#references)

## Features

- Generate Code based on a database table XML
- Supported Database Types:
  - MySQL (v4 & v5+)
  - PostgreSQL (coming soon)
  - Microsoft SQL Server
  - Oracle (incomplete)
  - Informix (incomplete)
- XSLT Templates for Code Generation
  - Easy to modify
  - Simple to add new templates
  - Supports almost any programming language
- Included Templates:
  - Taffy API (Tag and Script)
  - ORM CFC's (Tag and Script)
  - CF DAO's
  - CF Service's
  - CF Bean's

## Languages

- Vue 3 with `<script setup>` SFCs
- ColdFusion / Lucee backend (CFML)
  - Taffy.io API for Datasource and Table XML generation (JSON/REST)

## Prerequisites

- Node.js (>= 14.x)
- npm (>= 6.x)
- CommandBox, ColdFusion or Lucee server
  - Taffy.io
  - Or any other API that can return the required Table XML

## Installation

### Frontend (Vue 3)

1. Clone the repository:

   ```sh
   git clone https://github.com/chewymole/cfcGenerator.git
   cd cfc-generator
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Start the development server:

   ```sh
   npm run dev:all
   ```

### Backend (ColdFusion / Lucee)

1. Ensure you have a CFML server running. Or use your own API server.
2. If you are using the included CommandBox server, You MUST setup a valid Datasource. If you are using your own API server, you must know the datasource name.
3. You can use the included CommandBox server by running `npm run api`
   1. Or deploy the `api` folder to your server.
4. Configure the `.env` file to point to your API.
   1. ```json
      VITE_DEBUG_MODE=false
      VITE_API_BASE_URL=http://localhost:8080/index.cfm?endpoint=
      VITE_APP_BASE_URL=/
      ```
5. Configure the `/public/config.js` as well to make sure the base url path to the /xsl file is correct. If you are hosting in a subdirectory, this should be: `/myfolder/path/to/index.html`
   1. ```json
      window.APP_CONFIG = {
        BASE_URL: "/",
        API_URL: "http://localhost:8080/?endpoint=",
      };
      ```
6. If you roll your own API, use the included code as a starter.
   The frontend expects the following endpoints:
   `GET:/tables?datasourceName=`<datasource name>
   `POST:/datasource { "datasourceName":"<datasource name>" }`
   Use the `/resources` as a starting point, then review the code in the `/model/` for how to parse the different database types and how it generates the table XML.
7. Path issues:
   1. If you plan to deploy the /api to a subfolder on your server, review the .env and config.js files. These are needed to point to the correct folder that contains the XML/XSL files. If you get a blank screen, check this first.
   2. If you deploy to the root folder, just make sure to verify the .env and config.js files are using the correct paths and API url's

## Usage

1. Access the Vue 3 frontend at `http://localhost:3000` (or the port specified in your Vite config). Or run `npm build` and deploy the `dist` folder to your server.
2. Use the interface to Enter the Datasource Name, then select the Tables you want to generate code for, then select the template you want to use.
3. Click the Generate Code button.
4. Review the generated code, then click the Save or Save All buttons to download the generated code to your local machine.
5. From there, review the code in your editor of choice and make the needed adjustments for your environment and deploy to your testing server for review.
6. Have fun.
7. I thank my Lord and Savior Jesus Christ for this blessing to be able to share this small part of my life with you. If you have any questions, please feel free to contact me.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## References

- [Vue 3 Documentation](https://v3.vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [ColdFusion Documentation](https://helpx.adobe.com/coldfusion/user-guide.html)
- [Lucee Documentation](https://docs.lucee.org/)
- [Taffy.io Documentation](https://taffy.io/)
