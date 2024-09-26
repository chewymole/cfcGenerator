<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="text" indent="no"  />
		<xsl:template match="/">
&lt;cfcomponent extends="taffy.core.resource" taffy_uri="/<xsl:value-of select="//bean/@name"/>/{<xsl:for-each select="root/bean/dbtable/column[@primaryKey='Yes']"><xsl:value-of select="@name" /><xsl:if test="position() != last()">/</xsl:if></xsl:for-each>}" displayname="<xsl:value-of select="//bean/@name"/>Service" hint="Service based Taffy API. This table ID column = <xsl:for-each select="root/bean/dbtable/column[@primaryKey='Yes']"><xsl:value-of select="@name" /><xsl:if test="position() != last()">,</xsl:if></xsl:for-each>"&gt;
	&lt;cfset variables.<xsl:value-of select="//bean/@name"/>Service = new services.<xsl:value-of select="//bean/@name"/>Service()/&gt;
	&lt;!--- 
	adjust these as needed, this is just a getting started template. 
	---&gt;
	
	<!-- custom code -->

&lt;/cfcomponent&gt;</xsl:template>
</xsl:stylesheet>