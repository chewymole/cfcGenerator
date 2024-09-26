<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="text" indent="no"/>
    
    <xsl:template match="/">
        <xsl:apply-templates select="//table"/>
    </xsl:template>
    
    <xsl:template match="table">
component persistent="true" table="<xsl:value-of select="@name"/>">
<xsl:apply-templates select="column"/>

    public function init() {
        return this;
    }

    public struct function getMemento() {
        var memento = {};
        <xsl:for-each select="column">
        memento["<xsl:value-of select="@name"/>"] = this.get<xsl:value-of select="@name"/>();
        </xsl:for-each>
        return memento;
    }
<xsl:if test="column[@type='datetime' and @nullable='false']">

    public void function preInsert() {
    <xsl:for-each select="column[@type='datetime' and @nullable='false']">
        if (isNull(this.get<xsl:value-of select="@name"/>())){
            this.set<xsl:value-of select="@name"/>(now());
        }
    </xsl:for-each>
    }
</xsl:if>
}
    </xsl:template>
    
    <xsl:template match="column">
    property name="<xsl:value-of select="@name"/>"<xsl:if test="@primaryKey='true'"> fieldtype="id" generator="identity"</xsl:if>;</xsl:template>
</xsl:stylesheet>