
	&lt;cffunction name="post" access="public" output="false" hint="REST POST VERB for <xsl:value-of select="//dbtable/@name" />. Use to insert records."&gt;
		<xsl:for-each select="root/bean/dbtable/column">&lt;cfargument name="<xsl:value-of select="@name" />" type="<xsl:value-of select="@type" />" required="<xsl:value-of select="@required" />" /&gt;
		</xsl:for-each>
		
		&lt;cfif <xsl:for-each select="root/bean/dbtable/column[@identity != 'true']">isNull(arguments.<xsl:value-of select="@name" />)<xsl:if test="position() != last()"> AND </xsl:if> 
		<xsl:if test="position() = last()">&gt; 
			&lt;cfreturn rep({result="not found", data=[]}).withStatus(404) /&gt;
		&lt;/cfif&gt;
		</xsl:if>
		</xsl:for-each>

		&lt;cfset var res = "" /&gt;
		&lt;!--- 
			Does an insert into table and then returns the select from the same table. 
			You may need to adjust the return query depending on your dbms.
			
			TODO: 	Verify your mappings.. I set varibles instance to your services cfc
					Assumes your service contains a function named 'new' that handles record inserts and returns the new row
		---&gt;
		&lt;cftry&gt;
			&lt;cfset var res = variables.<xsl:value-of select="//bean/@name"/>Service.new(arguments)/&gt;						
			
			&lt;cfcatch type="database"&gt;
				&lt;cfreturn rep({result="failed",error=#cfcatch.message#}).withStatus(500) /&gt;
			&lt;/cfcatch&gt;
		&lt;/cftry&gt;
		&lt;cfreturn rep({result="success",data=res}).withStatus(201)/&gt;
	&lt;/cffunction&gt;
	
	