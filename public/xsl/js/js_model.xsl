<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  
  <xsl:output method="text" indent="no"/>  
  <xsl:template match="/">  
class <xsl:value-of select="//bean/@name"/> {
  constructor(<xsl:for-each select="root/bean/dbtable/column[@primaryKey='Yes']"><xsl:value-of select="@name"/>, </xsl:for-each>
  <xsl:for-each select="root/bean/dbtable/column[@primaryKey!='Yes']"><xsl:value-of select="@name"/><xsl:if test="position() != last()">, </xsl:if></xsl:for-each>) {
    <xsl:for-each select="root/bean/dbtable/column[@primaryKey='Yes']">this.<xsl:value-of select="@name"/> = <xsl:value-of select="@name"/>;
    </xsl:for-each>
    <xsl:for-each select="root/bean/dbtable/column[@primaryKey!='Yes']">this.<xsl:value-of select="@name"/> = <xsl:value-of select="@name"/>;
    </xsl:for-each>}

  // Getters and setters
  <xsl:for-each select="root/bean/dbtable/column">
  get<xsl:value-of select="@name"/>() {
    return this.<xsl:value-of select="@name"/>;
  }
  set<xsl:value-of select="@name"/>(value) {
    this.<xsl:value-of select="@name"/> = value;
  }
  </xsl:for-each>
}

module.exports = <xsl:value-of select="//bean/@name"/>;
  </xsl:template>
</xsl:stylesheet>