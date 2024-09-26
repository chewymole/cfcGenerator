<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="text" indent="no"  />
		<xsl:template match="/">
&lt;cfcomponent name="<xsl:value-of select="//bean/@name"/>" persistent="true" table="<xsl:value-of select="//dbtable/@name" />" output="false"&gt;

	&lt;cffunction name="init" access="public" output="false"&gt;
		&lt;cfreturn this/&gt;
	&lt;/cffunction&gt;

	<!-- custom code -->
&lt;/cfcomponent&gt;</xsl:template>
</xsl:stylesheet>