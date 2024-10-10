<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text" indent="no"/>  
  <xsl:template match="/">
&lt;?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class <xsl:value-of select="//bean/@name"/> extends Model
{
    protected $table = '<xsl:value-of select="//bean/@name"/>';
    protected $fillable = [
        <xsl:for-each select="root/bean/dbtable/column[not(@primaryKey='Yes')]">
        '<xsl:value-of select="@name"/>',</xsl:for-each>
    ];
    protected $casts = [
        <xsl:for-each select="root/bean/dbtable/column">
        '<xsl:value-of select="@name"/>' => '<xsl:call-template name="mapDataType"><xsl:with-param name="dataType" select="@type"/></xsl:call-template>',</xsl:for-each>
    ];
    // You can define relationships here
    // public function relatedModel()
    // {
    //     return $this->hasMany(RelatedModel::class);
    // }
}
  </xsl:template>

  <xsl:template name="mapDataType">
    <xsl:param name="dataType"/>
    <xsl:choose>
      <xsl:when test="$dataType = 'numeric'">integer</xsl:when>
      <xsl:when test="$dataType = 'date'">datetime</xsl:when>
      <xsl:when test="$dataType = 'string'">string</xsl:when>
      <xsl:otherwise>string</xsl:otherwise>
    </xsl:choose>
  </xsl:template>
</xsl:stylesheet>