<cfcomponent name="Postgresql" extends="dbms">
	
	<cffunction name="init" access="public" output="false" returntype="postgresql">
		<cfargument name="dsn" type="string" required="true" />
		<cfset super.init(arguments.dsn,"postgresql") />
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
			SELECT table_name
				,CASE WHEN table_type = 'BASE TABLE' 
					THEN 'TABLE' 
					ELSE table_type 
				END 
			FROM information_schema.tables
			WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
			ORDER BY table_name
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

	<cffunction name="getTableXML" access="public" output="false" returntype="xml">
		<cfset var xmlTable = "" />
		<!--- convert the table data into an xml format --->
		<!--- added listfirst to the sql_type because identity is sometimes appended --->
		<cfxml variable="xmlTable">
		<cfoutput>
		<root>
			<bean name="#listLast(variables.componentPath,'.')#" path="#variables.componentPath#">
				<dbtable name="#variables.table#" type="postgresql" dsn="#variables.dsn#">
				<cfloop query="variables.tableMetadata">
					<column name="#variables.tableMetadata.column_name#"
							type="<cfif listFindNoCase('char,character', variables.tableMetadata.type_name) AND variables.tableMetadata.length EQ 35>uuid<cfelse>#translateDataType(listFirst(variables.tableMetadata.type_name," "))#</cfif>"
							cfSqlType="#translateCfSqlType(listFirst(variables.tableMetadata.type_name," "))#"
							required="#yesNoFormat(variables.tableMetadata.nullable-1)#"
							length="#variables.tableMetadata.length#"
							primaryKey="#yesNoFormat(listFind(variables.primaryKeyList,variables.tableMetadata.column_name))#"
							identity="#variables.tableMetadata.identity#" />
				</cfloop>
				</dbtable>
			</bean>
		</root>
		</cfoutput>
		</cfxml>
		<cfreturn xmlTable />
	</cffunction>
	
	<!--- these functions are modified from reactor --->
	<cffunction name="translateCfSqlType" hint="I translate the Postgres data type names into ColdFusion cf_sql_xyz names" output="false" returntype="string">
		<cfargument name="typeName" hint="I am the type name to translate" required="yes" type="string" />
		<cfreturn getSQLType(arguments.typeName)/>
		
	</cffunction>
	
	<cffunction name="translateDataType" hint="I translate the Postgres data type names into ColdFusion data type names" output="false" returntype="string">
		<cfargument name="typeName" hint="I am the type name to translate" required="yes" type="string" />
		<cfreturn getCFType(arguments.typeName)/>
	</cffunction>
	
	<cffunction name="setTableMetadata" access="private" output="false" returntype="void">
		<cfset var qTable = "" />
		<!--- get table column info --->
		<!--- This is a modified version of the query in sp_columns --->
		<cfquery name="qTable" datasource="#variables.dsn#">
			SELECT COLUMN_NAME
				,CASE
					WHEN IS_NULLABLE = 'Yes' AND COLUMN_DEFAULT IS NULL THEN 'true'
					ELSE 'false'
				END AS nullable
				,DATA_TYPE AS type_name
				,CASE
					WHEN CHARACTER_MAXIMUM_LENGTH IS NULL THEN 0
					ELSE CHARACTER_MAXIMUM_LENGTH
				END as length
				,CASE
					WHEN data_type = 'serial' THEN 'true'
					WHEN data_type = 'bigserial' THEN 'true'
					ELSE 'false'
				END AS identity
			FROM information_schema.COLUMNS
			WHERE TABLE_NAME = <cfqueryparam cfsqltype="cf_sql_varchar" maxlength="128" value="#variables.table#" />
		</cfquery>
		<cfset variables.tableMetadata = qTable />
	</cffunction>
	
	
	<cffunction name="setPrimaryKeyList" access="private" output="false" returntype="void">
		<cfset var qPrimaryKeys = "" />
		<cfset var lstPrimaryKeys = "" />
		<cfquery name="qPrimaryKeys" datasource="#variables.dsn#">
			SELECT column_name 
			FROM information_schema.table_constraints a
				,information_schema.key_column_usage b
			WHERE a.table_name = b.table_name
			AND a.constraint_name = b.constraint_name
			AND a.constraint_type = <cfqueryparam cfsqltype="cf_sql_varchar" value="PRIMARY KEY" />
			AND a.table_name = <cfqueryparam cfsqltype="cf_sql_varchar" scale="128" value="#variables.table#" />
		</cfquery>
		<cfset lstPrimaryKeys = valueList(qPrimaryKeys.column_name) />
		<cfset variables.primaryKeyList = lstPrimaryKeys />
	</cffunction>
	

	
</cfcomponent>
