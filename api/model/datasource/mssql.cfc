<cfcomponent name="mssql" extends="dbms">

	<cffunction name="init" access="public" output="false" returntype="mssql">
		<cfargument name="dsn" type="string" required="true" />
		<cfset super.init(arguments.dsn,"mssql") />
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
			exec sp_tables @table_type="'Table'"
		</cfquery>
		<cfloop query="qAllTables">
			<!--- <cfset objTable = createObject("component","cfcgenerator.com.cf.model.datasource.table.table").init(qAllTables.table_name,qAllTables.table_type) /> --->
			<cfset arrayAppend(arrReturn,table_name) />
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
			SELECT	c.COLUMN_NAME,
				c.DATA_TYPE as TYPE_NAME,
				CASE
					WHEN ISNUMERIC(c.CHARACTER_MAXIMUM_LENGTH) = 1 THEN c.CHARACTER_MAXIMUM_LENGTH
					ELSE 0
					END as LENGTH,
				CASE
					WHEN c.IS_NULLABLE = 'No' AND c.Column_Default IS NULL THEN 0 /* a column is defined as nullable only if it doesn't have a default */
					ELSE 1
				END as NULLABLE,
				CASE
					WHEN columnProperty(object_id(c.TABLE_NAME), c.COLUMN_NAME, 'IsIdentity') > 0 THEN 'true'
					ELSE 'false'
				END AS [IDENTITY]
			FROM INFORMATION_SCHEMA.COLUMNS as c
			WHERE c.TABLE_NAME = <cfqueryparam cfsqltype="cf_sql_varchar" value="#variables.table#" />
				and c.COLUMN_NAME != 'MSREPL_TRAN_VERSION'
		</cfquery>
		<cfset variables.tableMetadata = qTable />
	</cffunction>
	

	<cffunction name="setPrimaryKeyList" access="private" output="false" returntype="void">
		<cfset var qPrimaryKeys = "" />
		<cfset var lstPrimaryKeys = "" />
		<cfquery name="qPrimaryKeys" datasource="#variables.dsn#">
			SELECT ccu.COLUMN_NAME,ccu.CONSTRAINT_NAME AS PK_NAME
			FROM INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE ccu
				INNER JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
				ON ccu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
			AND 	ccu.TABLE_NAME = <cfqueryparam cfsqltype="cf_sql_varchar" value="#variables.table#" />
			AND	tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
		</cfquery>
		<cfset lstPrimaryKeys = valueList(qPrimaryKeys.column_name) />
		<cfset variables.primaryKeyList = lstPrimaryKeys />
	</cffunction>
	

	
</cfcomponent>