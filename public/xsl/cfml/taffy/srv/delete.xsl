
	&lt;cffunction name="delete" access="public" output="false"&gt;
		<xsl:for-each select="root/bean/dbtable/column[@primaryKey='Yes']">&lt;cfargument name="<xsl:value-of select="@name"/>" type="<xsl:value-of select="@type" />" required="true" /&gt;
		</xsl:for-each>		
		&lt;!--- 
			Runs a delete row on table. 
			
			TODO: 	Verify your mappings.. I set varibles instance to your services cfc
					Assumes your service contains a function named 'delete' that handles record deletes and returns true on success
		---&gt;
		&lt;cftry&gt;
			&lt;cfset var res = variables.<xsl:value-of select="//bean/@name"/>Service.delete(arguments)/&gt;	
			&lt;cfcatch&gt;
				&lt;cfreturn rep({result="failed",error=#cfcatch.message#}).withStatus(500) /&gt;
			&lt;/cfcatch&gt;
		&lt;/cftry&gt;
		&lt;cfreturn rep({result="success"}).withStatus(200) /&gt;
	&lt;/cffunction&gt;
	
	