	
	&lt;cffunction name="getByAttributes" access="public" output="false" returntype="query"&gt;
		<xsl:for-each select="root/bean/dbtable/column">&lt;cfargument name="<xsl:value-of select="@name" />" type="<xsl:value-of select="@type" />" required="false" /&gt;
		</xsl:for-each>&lt;cfargument name="orderby" type="string" required="false" /&gt;
		
		&lt;cfset var qList = "" /&gt;		
		&lt;cfquery name="qList"&gt;
			SELECT
				<xsl:for-each select="root/bean/dbtable/column"><xsl:value-of select="@name" /><xsl:if test="position() != last()">,
				</xsl:if>
				</xsl:for-each>
			FROM	<xsl:value-of select="//dbtable/@name" />
			WHERE	0=0
		<xsl:for-each select="root/bean/dbtable/column">
		&lt;cfif structKeyExists(arguments,"<xsl:value-of select="@name" />") and len(arguments.<xsl:value-of select="@name" />)&gt;
			AND	<xsl:value-of select="@name" /> = &lt;cfqueryparam value="#arguments.<xsl:value-of select="@name" />#" CFSQLType="<xsl:value-of select="@cfSqlType" />" /&gt;
		&lt;/cfif&gt;</xsl:for-each>
		&lt;cfif structKeyExists(arguments, "orderby") and len(arguments.orderBy)&gt;
			ORDER BY #arguments.orderby#
		&lt;/cfif&gt;
		&lt;/cfquery&gt;
		
		&lt;cfreturn qList /&gt;
	&lt;/cffunction&gt;
	
	&lt;cffunction name="queryRowToStruct" access="private" output="false" returntype="struct"&gt;
		&lt;cfargument name="qry" type="query" required="true"&gt;
		
		&lt;cfscript&gt;
			/**
			 * Makes a row of a query into a structure.
			 * 
			 * @param query 	 The query to work with. 
			 * @param row 	 Row number to check. Defaults to row 1. 
			 * @return Returns a structure. 
			 * @author Nathan Dintenfass (nathan@changemedia.com) 
			 * @version 1, December 11, 2001 
			 */
			//by default, do this to the first row of the query
			var row = 1;
			//a var for looping
			var ii = 1;
			//the cols to loop over
			var cols = listToArray(qry.columnList);
			//the struct to return
			var stReturn = structnew();
			//if there is a second argument, use that for the row number
			if(arrayLen(arguments) GT 1)
				row = arguments[2];
			//loop over the cols and build the struct from the query row
			for(ii = 1; ii lte arraylen(cols); ii = ii + 1){
				stReturn[cols[ii]] = qry[cols[ii]][row];
			}		
			//return the struct
			return stReturn;
		&lt;/cfscript&gt;
	&lt;/cffunction&gt;