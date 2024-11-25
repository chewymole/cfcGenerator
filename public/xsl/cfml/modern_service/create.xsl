	&lt;cffunction name="create" access="public" output="false" returntype="boolean"&gt;
		<xsl:for-each select="root/bean/dbtable/column[@identity != 'true']">&lt;cfargument name="<xsl:value-of select="@name" />" type="<xsl:value-of select="@type" />" required="<xsl:value-of select="@required" />" /&gt;
		</xsl:for-each>
		
		&lt;cftry&gt;
			&lt;cfquery datasource="#variables.dsn#"&gt;
				INSERT INTO <xsl:value-of select="//dbtable/@name" />
					(
					<xsl:for-each select="root/bean/dbtable/column[@identity != 'true']"><xsl:value-of select="@name" /><xsl:if test="position() != last()">,
					</xsl:if>
					</xsl:for-each>
					)
				VALUES
					(
					<xsl:for-each select="root/bean/dbtable/column[@identity != 'true']">&lt;cfqueryparam value="#arguments.<xsl:value-of select="@name"/>#" CFSQLType="<xsl:value-of select="@cfSqlType" />"<xsl:if test="@required != 'Yes'"> null="#not len(arguments.<xsl:value-of select="@name"/>)#"</xsl:if> /&gt;<xsl:if test="position() != last()">,
					</xsl:if>
					</xsl:for-each>
					)
			&lt;/cfquery&gt;
			&lt;cfcatch type="database"&gt;
				&lt;cfreturn false /&gt;
			&lt;/cfcatch&gt;
		&lt;/cftry&gt;
		&lt;cfreturn true /&gt;
	&lt;/cffunction&gt;