<cfcomponent name="informix" extends="dbms">
	
	<cffunction name="init" access="public" output="false" returntype="informix">
		<cfargument name="dsn" type="string" required="true" />
		
		<cfset super.init(arguments.dsn,"informix")/>
		<cfreturn this />
	</cffunction>
	
	<cffunction name="getTables" access="public" output="false" returntype="array">
		<cfset var qAllTables = "" />
		<cfset var objTable = "" />
		<cfset var arrReturn = arrayNew(1) />
		
		<cfif not len(variables.dsn)>
			<cfthrow message="you must provide a dsn" />
		</cfif>
		
		<cfquery name="qAllTables" datasource="#variables.dsn#">
			SELECT 
			tabname
			, owner
			, tabtype
			FROM systables
			WHERE tabid > 99
			AND tabtype IN ('T','V')
			ORDER BY 1
		</cfquery>
		
		<cfloop query="qAllTables">
			<!--- <cfset objTable = createObject("component","cfcgenerator.com.cf.model.datasource.table.table").init(qAllTables.tabname,qAllTables.tabtype) /> --->
			<cfset arrayAppend(arrReturn,tabname) />
		</cfloop>
		<cfreturn arrReturn />
	</cffunction>
	
	<cffunction name="setTable" access="public" output="false" returntype="void">
		<cfargument name="table" type="string" required="true" />		
		<cfset variables.table = arguments.table />
		<cfset setTableMetadata() />
		<cfset setPrimaryKeyList() />
	</cffunction>

	<!--- these functions are modified from reactor v0.1 --->
	<cffunction name="translateCfSqlType" hint="I translate the MSSQL data type names into ColdFusion cf_sql_xyz names" output="false" returntype="string">
		<cfargument name="typeName" hint="I am the type name to translate" required="yes" type="string" />
		<cfreturn getSQLType(arguments.typeName)/>
	</cffunction>
	
	<cffunction name="translateDataType" hint="I translate the MSSQL data type names into ColdFusion data type names" output="false" returntype="string">
		<cfargument name="typeName" hint="I am the type name to translate" required="yes" type="string" />
		<cfreturn getCFType(arguments.typeName)/>
	</cffunction>
	
	<cffunction name="setTableMetadata" access="private" output="false" returntype="void">
		<cfset var qTable = "" />
		<!--- get table column info --->
		<!--- This is a modified version of the query in sp_columns --->
		<cfquery name="qTable" datasource="#variables.dsn#">
			SELECT
			c.colname AS COLUMN_NAME
			, CASE
				WHEN c.coltype = 262
				THEN c.coltype
				WHEN c.coltype >= 256
				THEN (c.coltype-256)
				ELSE c.coltype
				END 
				AS TYPE_NAME
			, c.collength AS LENGTH
			, CASE
				WHEN c.coltype >= 256  
				THEN 0
				ELSE 1
				END 
				AS NULLABLE
			, CASE
				WHEN c.coltype = 262  
				THEN 1
				ELSE 0
				END 
				AS IDENTITY
			FROM syscolumns c
			WHERE c.tabid = (	SELECT t.tabid
								FROM systables t
								WHERE t.tabid > 99
								AND t.tabname = <cfqueryparam
													cfsqltype="cf_sql_char"
													null="#YesNoFormat(Len(variables.table) EQ 0)#"
													value="#variables.table#">
							)
			ORDER BY c.colno, c.colname
		</cfquery>
		
		<cfset variables.tableMetadata = qTable />
	</cffunction>
	
	
	<cffunction name="setPrimaryKeyList" access="private" output="false" returntype="void">
		<cfset var qPrimaryKeys = "" />
		<cfset var lstPrimaryKeys = "" />
		<cfset var i = 0>
		<cfset var qTableId = "">
		<cfset var tableID = 0>
		
		<cfquery name="qTableId" datasource="#variables.dsn#">
			SELECT t.tabid
			FROM systables t
			WHERE t.tabid > 99
			AND t.tabname = <cfqueryparam
								cfsqltype="cf_sql_char"
								null="#YesNoFormat(Len(variables.table) EQ 0)#"
								value="#variables.table#">
		</cfquery>
		
		<cfset tableID = Trim(qTableId.tabid)>
		
		<cfquery name="qPrimaryKeys" datasource="#variables.dsn#">
		  	<cfloop from="1" to="16" index="i" step="1">
				<cfif i GT 1>UNION</cfif>
		  		SELECT 
		  		i.idxname AS PK_NAME
		  		, i.idxtype
		  		<cfif i eq 1>
					, i.part#i# AS index_order
		  		<cfelse>
					, i.part#i#
		  		</cfif>
		  		, c.colname AS COLUMN_NAME
		  		FROM sysindexes i
		  		INNER JOIN syscolumns c ON (i.tabid = c.tabid AND c.colno = i.part#i#)
		  		WHERE i.tabid = <cfqueryparam cfsqltype="cf_sql_char" value="#tableID#">
				AND i.idxtype = <cfqueryparam cfsqltype="cf_sql_char" value="U">
				AND i.part#i# != <cfqueryparam cfsqltype="cf_sql_char" value="0">
	  		</cfloop>
		</cfquery>

		<cfset lstPrimaryKeys = valueList(qPrimaryKeys.column_name) />
		<cfset variables.primaryKeyList = lstPrimaryKeys />
	</cffunction>
	

	
</cfcomponent>