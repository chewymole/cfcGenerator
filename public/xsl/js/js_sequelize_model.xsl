<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  
  <xsl:output method="text" indent="no"/>  
  <xsl:template match="/">   
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class <xsl:value-of select="//bean/@name"/> extends Model {}

<xsl:value-of select="//bean/@name"/>.init({
  <xsl:for-each select="root/bean/dbtable/column[@primaryKey='Yes']">
  <xsl:value-of select="@name"/>: {
    type: DataTypes.<xsl:call-template name="mapDataType">
      <xsl:with-param name="dataType" select="@type"/>
    </xsl:call-template>,
    <xsl:if test="@primaryKey = 'Yes'">primaryKey: true,</xsl:if>
    <xsl:if test="@required = 'Yes'">allowNull: false,</xsl:if>
  },</xsl:for-each>
  <xsl:for-each select="root/bean/dbtable/column[@primaryKey!='Yes']">
  <xsl:value-of select="@name"/>: {
    type: DataTypes.<xsl:call-template name="mapDataType">
      <xsl:with-param name="dataType" select="@type"/>
    </xsl:call-template>,
    <xsl:if test="@required = 'Yes'">allowNull: false,</xsl:if>
  },</xsl:for-each>
}, {
  sequelize,
  modelName: '<xsl:value-of select="//bean/@name"/>',
  tableName: '<xsl:value-of select="//bean/@name"/>',
  timestamps: false,
});

module.exports = <xsl:value-of select="//bean/@name"/>;
  </xsl:template>

  <xsl:template name="mapDataType">
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