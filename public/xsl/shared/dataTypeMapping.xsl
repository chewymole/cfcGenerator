<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!-- Laravel/PHP Data Type Mappings -->
  <xsl:template name="mapLaravelType">
    <xsl:param name="dataType"/>
    <xsl:choose>
      <xsl:when test="$dataType = 'numeric'">integer</xsl:when>
      <xsl:when test="$dataType = 'decimal'">decimal</xsl:when>
      <xsl:when test="$dataType = 'float'">float</xsl:when>
      <xsl:when test="$dataType = 'date'">datetime</xsl:when>
      <xsl:when test="$dataType = 'datetime'">datetime</xsl:when>
      <xsl:when test="$dataType = 'timestamp'">timestamp</xsl:when>
      <xsl:when test="$dataType = 'string'">string</xsl:when>
      <xsl:when test="$dataType = 'text'">text</xsl:when>
      <xsl:when test="$dataType = 'longtext'">longtext</xsl:when>
      <xsl:when test="$dataType = 'boolean'">boolean</xsl:when>
      <xsl:otherwise>string</xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- ColdFusion Data Type Mappings -->
  <xsl:template name="mapCFMLType">
    <xsl:param name="dataType"/>
    <xsl:choose>
      <xsl:when test="$dataType = 'numeric'">numeric</xsl:when>
      <xsl:when test="$dataType = 'decimal'">numeric</xsl:when>
      <xsl:when test="$dataType = 'float'">numeric</xsl:when>
      <xsl:when test="$dataType = 'date'">date</xsl:when>
      <xsl:when test="$dataType = 'datetime'">timestamp</xsl:when>
      <xsl:when test="$dataType = 'timestamp'">timestamp</xsl:when>
      <xsl:when test="$dataType = 'string'">string</xsl:when>
      <xsl:when test="$dataType = 'text'">string</xsl:when>
      <xsl:when test="$dataType = 'longtext'">string</xsl:when>
      <xsl:when test="$dataType = 'boolean'">boolean</xsl:when>
      <xsl:otherwise>string</xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- JavaScript Data Type Mappings -->
  <xsl:template name="mapJavaScriptType">
    <xsl:param name="dataType"/>
    <xsl:choose>
      <xsl:when test="$dataType = 'numeric'">number</xsl:when>
      <xsl:when test="$dataType = 'decimal'">number</xsl:when>
      <xsl:when test="$dataType = 'float'">number</xsl:when>
      <xsl:when test="$dataType = 'date'">Date</xsl:when>
      <xsl:when test="$dataType = 'datetime'">Date</xsl:when>
      <xsl:when test="$dataType = 'timestamp'">Date</xsl:when>
      <xsl:when test="$dataType = 'string'">string</xsl:when>
      <xsl:when test="$dataType = 'text'">string</xsl:when>
      <xsl:when test="$dataType = 'longtext'">string</xsl:when>
      <xsl:when test="$dataType = 'boolean'">boolean</xsl:when>
      <xsl:otherwise>string</xsl:otherwise>
    </xsl:choose>
  </xsl:template>
</xsl:stylesheet> 