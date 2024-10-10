
	&lt;cffunction name="put" access="public" output="false" hint="REST PUT VERB for <xsl:value-of select="//dbtable/@name" />. Use to Update records."&gt;
		<xsl:for-each select="root/bean/dbtable/column">&lt;cfargument name="<xsl:value-of select="@name" />" type="<xsl:value-of select="@type" />" required="<xsl:value-of select="@required" />" /&gt;
		</xsl:for-each>
		&lt;cfif <xsl:for-each select="root/bean/dbtable/column[@identity != 'true']">isNull(arguments.<xsl:value-of select="@name" />)<xsl:if test="position() != last()"> AND </xsl:if> 
		<xsl:if test="position() = last()">&gt; 
			&lt;cfreturn rep({result="not found", data=[]}).withStatus(404) /&gt;
		&lt;/cfif&gt;
		</xsl:if>
		</xsl:for-each>
		&lt;cfset var qUpdate = "" /&gt;
		&lt;cftry&gt;
			&lt;cfquery&gt;
				UPDATE	<xsl:value-of select="//dbtable/@name" />
				SET
					<xsl:for-each select="root/bean/dbtable/column[@primaryKey != 'Yes']"><xsl:value-of select="@name" /> = &lt;cfqueryparam value="#arguments.<xsl:value-of select="@name"/>#" CFSQLType="<xsl:value-of select="@cfSqlType" />"<xsl:if test="@required != 'Yes'"> null="#not len(arguments.<xsl:value-of select="@name"/>)#"</xsl:if> /&gt;<xsl:if test="position() != last()">,
					</xsl:if>
					</xsl:for-each>
				WHERE	<xsl:for-each select="root/bean/dbtable/column[@primaryKey='Yes']"><xsl:value-of select="@name" /> = &lt;cfqueryparam value="#arguments.<xsl:value-of select="@name"/>#" CFSQLType="<xsl:value-of select="@cfSqlType" />" /&gt;<xsl:if test="position() != last()">
				AND	</xsl:if></xsl:for-each>
			&lt;/cfquery&gt;
			&lt;cfquery name="qRes"&gt;
				select * from <xsl:value-of select="//dbtable/@name" />
				where <xsl:for-each select="root/bean/dbtable/column[@identity = 'true']"><xsl:value-of select="@name" /> = &lt;cfqueryparam value="#arguments.<xsl:value-of select="@name"/>#" CFSQLType="<xsl:value-of select="@cfSqlType" />"/&gt;
					</xsl:for-each>
			&lt;/cfquery&gt;
			&lt;cfcatch type="database"&gt;
				&lt;cfreturn rep({result="failed",error=#cfcatch.message#}).withStatus(500) /&gt;
			&lt;/cfcatch&gt;
		&lt;/cftry&gt;
		&lt;cfreturn rep({result='success'}).withStatus(200) /&gt;
	&lt;/cffunction&gt;
	
	