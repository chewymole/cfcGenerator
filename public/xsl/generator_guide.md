# Generator.xml Configuration Guide

## Basic Structure

The generator.xml file organizes templates into a hierarchical structure:

```xml
<generator version="1.0">
<category name="..." icon="...">
<subcategory name="...">
<template id="..." name="..." filetype="..." style="..." template="...">

<!-- Template configuration -->
</template>
</subcategory>
</category>
</generator>
```

## Categories and Subcategories

### Category Element

```xml
<category name="cfml" icon="file_type_cfc.svg">

<!-- Subcategories go here -->
</category>
```

- `name`: Programming language/framework (e.g., "cfml", "JavaScript", "Laravel")
- `icon`: Icon file to display in the UI

### Subcategory Element

```xml
<subcategory name="Model">

<!-- Templates go here -->
</subcategory>
```

- Used to organize related templates (e.g., "Model", "DAO", "Service")

## Template Configuration

### Basic Template Structure

```xml
<template
id="unique_template_id"
name="Display Name"
filetype="output_extension"
style="coding_style"
template="path/to/main.xsl">

<!-- Optional elements -->
<include file="path/to/include.xsl" />
<description>Template description</description>
<compatibility>
<language>supported_language</language>
<dbType>supported_databases</dbType>
</compatibility>
<children>
<template ref="dependent_template_id" required="true" />
</children>
</template>
```

### Template Attributes

- `id`: Unique identifier for the template
- `name`: Display name in the UI
- `filetype`: Output file extension (e.g., "cfc", "js", "php")
- `style`: Coding style ("tag", "script", "module", "class")
- `template`: Path to main XSL template file

### Include Files

```xml
<include file="path/to/include.xsl" />
```

- Includes additional XSL files for modular template organization
- Useful for breaking down complex templates into manageable pieces
- Allows you to reuse common functions without having to re-write them
- Includes are injected into the your XSL template as long as there is this comment somewhere in your template:
  ```html
  <!-- custom code -->
  ```

### Description

```xml
<description>Template description</description>
```

- Provides user-friendly description of what the template generates

### Compatibility

```xml
<compatibility>
<language>supported_language</language>
<dbType>supported_databases</dbType>
</compatibility>
```

- Specifies the languages and databases supported by the template, also used to determine if the template is compatible with the current project
- Specifies supported:

  - Programming languages
  - Database types

### Dependencies

```xml
<children>
   <template ref="dependent_template_id" required="true" />
</children>
```

- Specifies templates that will be generated after the current template
- `ref`: ID of the dependent template
- `required`: Boolean value indicating if the dependent template is required for the current template to generate
- Handy when you need to build a model and a service at the same time for the same set of tables.

## Example: Adding a New Template

### 1. Basic Template

```xml
<template
   id="js_vue_component"
   name="Vue Component"
   filetype="vue"
   style="module"
   template="js/vue_component.xsl">
  <description>Creates a Vue.js component for the model</description>
  <compatibility>
    <language>javascript</language>
    <dbType>mysql,mssql,postgresql</dbType>
  </compatibility>
</template>
```

### 2. Template with Includes

```xml
<template
    id="js_full_crud"
    name="CRUD Module"
    filetype="js"
    style="module"
    template="js/crud_module.xsl">

    <include file="js/crud/create.xsl" />
    <include file="js/crud/read.xsl" />
    <include file="js/crud/update.xsl" />
    <include file="js/crud/delete.xsl" />
    <description>Creates a complete CRUD module</description>
    <compatibility>
        <language>javascript</language>
        <dbType>mysql,mssql,postgresql</dbType>
    </compatibility>
</template>
```

### 3. Template with Dependencies

```xml
<template
    id="js_full_stack"
    name="Full Stack"
    filetype="js"
    style="module"
    template="js/full_stack.xsl">
    <description>Creates a complete full-stack implementation</description>
    <children>
       <template ref="js_model" required="true" />
       <template ref="js_dao" required="true" />
       <template ref="js_vue_component" required="true" />
    </children>
    <compatibility>
       <language>javascript</language>
       <dbType>mysql,mssql,postgresql</dbType>
    </compatibility>
</template>
```

## Best Practices

1. **Unique IDs**

   - Use descriptive, unique IDs for templates
   - Follow a consistent naming convention (e.g., language_type)
   - The app checks for unique ID's and will tell you if it finds invalid or duplciated ID's

2. **Modular Design**

   - Break down complex templates into includes
   - Use dependencies for related components

3. **Clear Documentation**

   - Provide detailed descriptions
   - Document compatibility requirements

4. **Logical Organization**

   - Group related templates in appropriate subcategories
   - Maintain a clear hierarchy
