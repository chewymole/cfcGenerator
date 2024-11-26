# Writing Custom XSL Templates - User Guide

## Available Model Data Structure

When writing templates, you have access to the following model structure:

### Basic Model Structure

```xml
xml
<root>
<model>
<name>YourModelName</name>
<path>optional/base/path</path>
<dbType>MSSQL|MySQL|PostgreSQL|Oracle|SQLite</dbType>
<language>cfml|JavaScript|Laravel</language>
<tables>
<!-- One or more table definitions -->
<table>
<name>TableName</name>
<path>optional/table/specific/path</path>
<columns>
<column>
<name>columnName</name>
<type>string|numeric|datetime|etc</type>
<length>optional-length</length>
<isPrimaryKey>true|false</isPrimaryKey>
<isNullable>true|false</isNullable>
<defaultValue>optional-default-value</defaultValue>
</column>
<!-- Additional columns -->
</columns>
</table>
</tables>
</model>
</root>
```

## Writing Templates

### Basic Template Structure

```xml
xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="text" indent="no"/>
    <!-- Main template -->
    <xsl:template match="/">
      <!-- Your template code here -->
    </xsl:template>
</xsl:stylesheet>
```

### Common XPath Expressions

```xml
xml
<!-- Access model name -->
<xsl:value-of select="//model/name"/>

<!-- Loop through all tables -->
<xsl:for-each select="//tables/table">

	<!-- Access table name -->
	<xsl:value-of select="name"/>

	<!-- Loop through columns -->
	<xsl:for-each select="columns/column">
		<!-- Access column properties -->
		<xsl:value-of select="name"/>
		<xsl:value-of select="type"/>
		<xsl:value-of select="isPrimaryKey"/>
	</xsl:for-each>
</xsl:for-each>

<!-- Find primary key columns -->
<xsl:for-each select="//column[isPrimaryKey='true']">
<!-- Work with primary keys -->
</xsl:for-each>
```

### Conditional Logic

```xml
xml
<!-- If statement -->
<xsl:if test="isPrimaryKey='true'">
<!-- Handle primary key -->
</xsl:if>

<!-- Choose/When/Otherwise -->
<xsl:choose>
	<xsl:when test="type='string'">
	<!-- Handle string type -->
	</xsl:when>

	<xsl:when test="type='numeric'">
	<!-- Handle numeric type -->
	</xsl:when>

	<xsl:otherwise>
	<!-- Handle other types -->
	</xsl:otherwise>
</xsl:choose>
```

Template Examples

#### Generate a Basic Class

```xml
<xsl:template match="/">
	class <xsl:value-of select="//model/name"/> {
		<xsl:for-each select="//tables/table/columns/column">
		private <xsl:value-of select="name"/>;<xsl:text>
		</xsl:text>
		</xsl:for-each>
	}
</xsl:template>
```

#### Generate Properties with Types

```xml
<xsl:template match="/">
	<xsl:for-each select="//columns/column">
	public <xsl:value-of select="type"/><xsl:text> </xsl:text><xsl:value-of select="name"/> { get; set; }
	</xsl:for-each>
</xsl:template>
```

## Best Practices

1. **Output Control**

   - Use `<xsl:text>` for explicit whitespace control
   - Consider using `indent="no"` for better output formatting control

2. **Modular Templates**

   - Break down complex templates into smaller templates using `<xsl:template name="templateName">`
   - Call templates using `<xsl:call-template name="templateName"/>`

3. **Error Handling**

   - Use conditional checks for optional elements
   - Provide default values where appropriate

4. **Documentation**

   - Comment your templates
   - Document any special handling or assumptions

## Tips & Tricks

1. **Debug Output**

   ```xml
   <xsl:message terminate="no">
       Debug: <xsl:value-of select="name"/>
   </xsl:message>
   ```

2. **String Manipulation**

   ```xml
   <!-- Convert to uppercase -->
   <xsl:value-of select="translate(name, 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>

   <!-- First character uppercase -->
   <xsl:value-of select="concat(
       translate(substring(name,1,1), 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
       substring(name,2)
   )"/>
   ```

3. **Position Information**

   ```xml
   <!-- Check if first item -->
   <xsl:if test="position()=1">
       <!-- Handle first item -->
   </xsl:if>

   <!-- Check if last item -->
   <xsl:if test="position()=last()">
       <!-- Handle last item -->
   </xsl:if>
   ```
