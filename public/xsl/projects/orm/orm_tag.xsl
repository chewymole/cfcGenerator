<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="text" indent="no"/>
    
    <xsl:template match="/">
        <xsl:apply-templates select="//table"/>
    </xsl:template>
    
    <xsl:template match="table">
&lt;cfcomponent persistent="true" table="<xsl:value-of select="@name"/>"&gt;
<xsl:apply-templates select="column"/>

    &lt;cffunction name="init" access="public" returntype="any" output="false"&gt;
        &lt;cfreturn this&gt;
    &lt;/cffunction&gt;

    &lt;cffunction name="getMemento" access="public" returntype="struct" output="false"&gt;
        &lt;cfset var memento = {}&gt;
        <xsl:for-each select="column">
        &lt;cfset memento["<xsl:value-of select="@name"/>"] = this.get<xsl:value-of select="@name"/>()/&gt;
        </xsl:for-each>
        &lt;cfreturn memento&gt;
    &lt;/cffunction&gt;
<xsl:if test="column[@type='datetime' and @nullable='false']">

    &lt;cffunction name="preInsert" access="public" returntype="void" output="false"&gt;
    <xsl:for-each select="column[@type='datetime' and @nullable='false']">
        &lt;cfif isNull(this.get<xsl:value-of select="@name"/>())&gt;
            &lt;cfset this.set<xsl:value-of select="@name"/>(now())&gt;
        &lt;/cfif&gt;
    </xsl:for-each>
    &lt;/cffunction&gt;
</xsl:if>
&lt;/cfcomponent&gt;
    </xsl:template>
    
    <xsl:template match="column">
    &lt;cfproperty name="<xsl:value-of select="@name"/>"<xsl:if test="@primaryKey='true'"> fieldtype="id" generator="identity"</xsl:if>/&gt;</xsl:template>
</xsl:stylesheet>