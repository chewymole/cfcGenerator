&lt;cffunction name="get" access="public" output="false" hint="REST GET VERB for <xsl:value-of select="//dbtable/@name" />"&gt;		
		<xsl:for-each select="root/bean/dbtable/column">&lt;cfargument name="<xsl:value-of select="@name" />" type="<xsl:value-of select="@type" />" required="false" /&gt;
		</xsl:for-each>

		&lt;cfset var qRead = "" /&gt;
		&lt;!--- 
			Example of using a query to get the data to return from the API
			You can remove any of the arguments that are not needed, also you may want to update the taffy_uri.
			This URI requires a value for the ID or what ever the column name is. 
			But you can always call this endpoint with any value you want for the HTTP :GET method.
			Example: 
				GET: http://localhost/api/?endpoint=<xsl:value-of select="//dbtable/@name" />/ALL&amp;email=someguy@aol.com
					=> would return all rows with that email.
				GET: http://localhost/api/?endpoint=<xsl:value-of select="//dbtable/@name" />/75599
					=> would return only the row with ID:75599
				PUT: http://localhost/api/?endpoint=<xsl:value-of select="//dbtable/@name" />/75599
					=> would update row ID:75599 with what ever values you pass into the arguments.
			Read more about this: https://docs.taffy.io/
			Tip: 	-If you want to use the token in any of your functions, 
					Taffy will auto-inject the token into that functions MATCHING argument. Otherwise, the value will be lost.
					-For complex API's, you will probably want to rename or split these files according to Domain Entities or what ever naming convention you choose.
						If your table names make no since in ragards to an API endpoint, consider renaming the endpoint (taffy_uri) to be more user friendly
						Also, the file names make no difference, they can be in different folders as well as long as they live under Taffy's configured resource folder. 
						Example with a table named db_admin_site_regular_users: Split into 2 files, Users.cfc and User.cfc under the /resources/admin_site/regular/ folder
						-Users.cfc: (/users/{id}) => (GET,POST) 
						-User.cfc:  (user/{id})	  => (GET,PUT,DELETE) 
						In this case, if you want your URI to be /Users or /User, it would make things easier for the next dev if the files were named the same.
						
						
		---&gt;
		&lt;cftry&gt;
			&lt;cfset qRead = {}/&gt;
			<xsl:for-each select="root/bean/dbtable/column">&lt;cfif not isNull(arguments.<xsl:value-of select="@name" />)&gt;&lt;cfset qread["<xsl:value-of select="@name" />"] = arguments.<xsl:value-of select="@name" />/&gt; &lt;/cfif&gt;
			</xsl:for-each>
			&lt;cfset var res = variables.<xsl:value-of select="//dbtable/@name" />Service.get(qRead)/&gt;
			
			&lt;cfcatch&gt;
				&lt;!--- leave the bean as is and set an empty query for the conditional logic below ---&gt;
				&lt;cfreturn rep({result="failed",error=cfcatch.message}).withStatus(500)&gt;
			&lt;/cfcatch&gt;
		&lt;/cftry&gt;
		&lt;cfif res.recordCount&gt;
			&lt;cfreturn rep({result="success",data=res}).withStatus(200)&gt;
		&lt;cfelse&gt;
			&lt;cfreturn rep({result="not found",data=res}).withStatus(404)&gt;
		&lt;/cfif&gt;
	&lt;/cffunction&gt;
	
	