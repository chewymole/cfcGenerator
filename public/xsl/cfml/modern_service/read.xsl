	&lt;cffunction name="read" access="public" output="false" returntype="void"&gt;
		<xsl:for-each select="root/bean/dbtable/column[@primaryKey='Yes']">&lt;cfargument name="<xsl:value-of select="@name" />" type="<xsl:value-of select="@type" />" required="<xsl:value-of select="@required" />" /&gt;
		</xsl:for-each>
		&lt;cfset var qRead = "" /&gt;
		&lt;cftry&gt;
			&lt;cfquery name="qRead" datasource="#variables.dsn#"&gt;
				SELECT
					<xsl:for-each select="root/bean/dbtable/column"><xsl:value-of select="@name" /><xsl:if test="position() != last()">,
					</xsl:if>
					</xsl:for-each>
				FROM	<xsl:value-of select="//dbtable/@name" />
				WHERE	<xsl:for-each select="root/bean/dbtable/column[@primaryKey='Yes']"><xsl:value-of select="@name" /> = &lt;cfqueryparam value="#arguments.<xsl:value-of select="@name"/>#" CFSQLType="<xsl:value-of select="@cfSqlType" />" /&gt;<xsl:if test="position() != last()">
				AND	</xsl:if></xsl:for-each>
			&lt;/cfquery&gt;
			&lt;cfcatch type="database"&gt;
				&lt;!--- leave the bean as is and set an empty query for the conditional logic below ---&gt;
				&lt;cfset qRead = queryNew("id") /&gt;
			&lt;/cfcatch&gt;
		&lt;/cftry&gt;
		&lt;cfreturn qRead /&gt;
	&lt;/cffunction&gt;