
	&lt;cffunction name="put" access="public" output="false" hint="REST PUT VERB for <xsl:value-of select="//dbtable/@name" />. Use to Update records."&gt;
		<xsl:for-each select="root/bean/dbtable/column">&lt;cfargument name="<xsl:value-of select="@name" />" type="<xsl:value-of select="@type" />" required="<xsl:value-of select="@required" />" /&gt;
		</xsl:for-each>
		&lt;cfif <xsl:for-each select="root/bean/dbtable/column[@identity != 'true']">isNull(arguments.<xsl:value-of select="@name" />)<xsl:if test="position() != last()"> AND </xsl:if> 
		<xsl:if test="position() = last()">&gt; 
			&lt;cfreturn rep({result="not found", data=[]}).withStatus(404) /&gt;
		&lt;/cfif&gt;
		</xsl:if>
		</xsl:for-each>
		&lt;!---
			TODO: 	Verify your mappings.. I set the varibles instance to your services cfc above ^
					Assumes your service contains a function named 'update' that handles record updates and returns that row
		
		---&gt;
		
		&lt;cfset var qUpdate = "" /&gt;
		&lt;cftry&gt;
			&lt;cfset var res = variables.<xsl:value-of select="//bean/@name"/>Service.update(arguments)/&gt;
			&lt;cfcatch&gt;
				&lt;cfreturn rep({result="failed",error=#cfcatch.message#}).withStatus(500) /&gt;
			&lt;/cfcatch&gt;
		&lt;/cftry&gt;
		&lt;cfreturn rep({result='success'}).withStatus(200) /&gt;
	&lt;/cffunction&gt;
	
	