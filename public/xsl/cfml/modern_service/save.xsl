	&lt;cffunction name="save" access="public" output="false" returntype="boolean"&gt;
		<xsl:for-each select="root/bean/dbtable/column">&lt;cfargument name="<xsl:value-of select="@name" />" type="<xsl:value-of select="@type" />" required="<xsl:value-of select="@required" />" /&gt;
		</xsl:for-each>
		&lt;cfset var success = false /&gt;
		&lt;cfif exists(arguments.<xsl:for-each select="root/bean/dbtable/column[@primaryKey='Yes']"><xsl:value-of select="@name" /></xsl:for-each>)&gt;
			&lt;cfset success = update(argumentsCollection=arguments) /&gt;
		&lt;cfelse&gt;
			&lt;cfset success = create(argumentsCollection=arguments) /&gt;
		&lt;/cfif&gt;
		
		&lt;cfreturn success /&gt;
	&lt;/cffunction&gt;