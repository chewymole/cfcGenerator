<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns="http://www.w3.org/1999/xhtml">
    
    <xsl:output method="text" indent="no"/>  
    
    <xsl:template match="/root">
        <xsl:text>&lt;?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class </xsl:text>
        <xsl:value-of select="bean/@name"/>
        <xsl:text> extends Model
{
    protected $table = '</xsl:text>
        <xsl:value-of select="bean/@name"/>
        <xsl:text>';
    protected $fillable = [
</xsl:text>
        <xsl:for-each select="bean/dbtable/column[not(@primaryKey='Yes')]">
            <xsl:text>        '</xsl:text>
            <xsl:value-of select="@name"/>
            <xsl:text>',
</xsl:text>
        </xsl:for-each>
        <xsl:text>    ];
}</xsl:text>
    </xsl:template>
  <xsl:template name="mapValidationType">
    <xsl:param name="dataType"/>
    <xsl:choose>
      <xsl:when test="$dataType = 'numeric'">numeric</xsl:when>
      <xsl:when test="$dataType = 'date'">date</xsl:when>
      <xsl:when test="$dataType = 'string'">string</xsl:when>
      <xsl:otherwise>string</xsl:otherwise>
    </xsl:choose>
  </xsl:template>
</xsl:stylesheet>