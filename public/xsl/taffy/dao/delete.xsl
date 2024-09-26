
	&lt;cffunction name="delete" access="public" output="false"&gt;
		<xsl:for-each select="root/bean/dbtable/column[@primaryKey='Yes']">&lt;cfargument name="<xsl:value-of select="@name"/>" type="<xsl:value-of select="@type" />" required="true" /&gt;
		</xsl:for-each>		

		&lt;cftry&gt;
			&lt;cfquery&gt;
				DELETE FROM	<xsl:value-of select="//dbtable/@name" /> 
				WHERE	<xsl:for-each select="root/bean/dbtable/column[@primaryKey='Yes']"><xsl:value-of select="@name" /> = &lt;cfqueryparam value="#arguments.<xsl:value-of select="@name"/>#" CFSQLType="<xsl:value-of select="@cfSqlType" />" /&gt;<xsl:if test="position() != last()">
				AND	</xsl:if></xsl:for-each>
			&lt;/cfquery&gt;
			&lt;cfcatch type="database"&gt;
				&lt;cfreturn rep({result="failed",error=#cfcatch.message#}).withStatus(500) /&gt;
			&lt;/cfcatch&gt;
		&lt;/cftry&gt;
		&lt;cfreturn rep({result="success"}).withStatus(200) /&gt;
	&lt;/cffunction&gt;
	
	