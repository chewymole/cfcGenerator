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

Ported from: [CFC Generator](https://github.com/deanlaw/cfcgenerator)

This is my first public real VueJS project, so please don't judge me too harshly. This project is a Vue 3 front-end with a ColdFusion / Lucee backend and a Taffy.io API that generates ColdFusion code. The origial project was created by [deanlaw](https://github.com/deanlaw) that used Flash as a frontend, it also required you to have the ColdFusion / Lucee Admin password to generate the code. This version has a Vue 3 frontend and a Taffy.io API that generates ColdFusion code. It does not require the ColdFusion / Lucee Admin password to generate the code. But you must have a valid Datasource configured on your server you plan to generate the code on and you must know the Datasource name.

One of the awesome parts from Dean's original project is that he used XSL style-sheets to generate the resulting code. I have ported his original code to use xml2js and xslt-processor to generate the resulting code on the client side within the VueJS application. This allows you to generate the code on your local machine and arrange the paths and folders how you like, then copy the generated code into your project and or server..

I improved the XML file that describes the templates, I added a Name, Description, syntax style attributes. These are displayed in the UI to help you identify the template you want to use.

I removed some of the older template types, and added an ORM template to generate the code for ORM code in both Tag and Script syntax and added a Taffy API template to generate an API based on the selected tables.

These templates are easy to modify to your liking, and you are not limited to using this for ColdFusion, you can use it for any language that you want, just make the new templates and style-sheets.

I have included a [Taffy.io](https://taffy.io/) API that is preconfigured to connect to any datasource configured in your Coldfusion/Lucee Server, given you know the Datasource name. You can use this API or you can use what ever API you want to generate the Table XML and datasource name validation, just modify the .env file to point to your API. The defualt is:

```
VITE_API_BASE_URL=http://localhost:8080/api/index.cfm?endpoint=
```

The API only has 2 endpoints.

`GET /tables`
Will return all the tables in the default datasource as a structure:

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

`POST /datasource`
Will return true if the given datasource name is valid and exists.
![ds endpoint](./public/images/datasource-endpoint.png)
![ds endpoint](./public/images/datasource-endpoint-result.png)

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [References](#references)

## Features

- Vue 3 with `<script setup>` SFCs
- ColdFusion / Lucee backend
- Taffy.io API for Datasource and Table XML generation

## Prerequisites

- Node.js (>= 14.x)
- npm (>= 6.x)
- ColdFusion or Lucee server
- Taffy.io

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
   npm run dev
   ```

### Backend (ColdFusion / Lucee)

1. Ensure you have a ColdFusion or Lucee server running.
2. Deploy the backend code to your server.
3. Configure the Taffy.io API as per your requirements.

## Usage

1. Access the Vue 3 frontend at `http://localhost:3000` (or the port specified in your Vite config).
2. Use the interface to interact with the Taffy.io API and generate ColdFusion code.

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
