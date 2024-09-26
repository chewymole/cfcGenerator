<cfcomponent name="Oracle" extends="dbms">

	<cffunction name="init" access="public" output="false" returntype="Oracle">
		<cfargument name="dsn" type="string" required="true" />
		<cfset super.init(arguments.dsn,"oracle")/>
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
			SELECT owner
        ,  TABLE_NAME
        , 'TABLE'   TABLE_TYPE
			FROM all_tables
			order by owner, TABLE_NAME
		</cfquery>
		<cfloop query="qAllTables">
			<!--- <cfset objTable = createObject("component","cfcgenerator.com.cf.model.datasource.table.table").init(qAllTables.owner & "." & qAllTables.table_name,qAllTables.table_type) /> --->
			<cfset arrayAppend(arrReturn,table_name) />
		</cfloop>
		<cfreturn arrReturn />
	</cffunction>

	
	<cffunction name="setTable" access="public" output="false" returntype="void">
		<cfargument name="table" type="string" required="true" />

		<cfif listlen(arguments.table,".") gt 1>
			<cfset variables.schema = listfirst(arguments.table,".") />
			<cfset variables.table = listlast(arguments.table,".") />
		<cfelse>
			<cfset variables.schema = "" />
			<cfset variables.table = arguments.table />
		</cfif>

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
				<dbtable name="<cfif len(variables.schema)>#variables.schema#.</cfif>#variables.table#" type="oracle" dsn="#variables.dsn#">
				<cfloop query="variables.tableMetadata">
					<column name="#variables.tableMetadata.column_name#"
							type="<cfif variables.tableMetadata.type_name EQ 'varchar2' AND variables.tableMetadata.length EQ 35 AND listFind(variables.primaryKeyList,variables.tableMetadata.column_name)>uuid<cfelse>#translateDataType(listFirst(variables.tableMetadata.type_name," "))#</cfif>"
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
	<cffunction name="translateCfSqlType" hint="I translate the Oracle data type names into ColdFusion cf_sql_xyz names" output="false" returntype="string">
		<cfargument name="typeName" hint="I am the type name to translate" required="yes" type="string" />
		<cfreturn getSQLType(arguments.typeName)/>
	</cffunction>

	<cffunction name="translateDataType" hint="I translate the Oracle data type names into ColdFusion data type names" output="false" returntype="string">
		<cfargument name="typeName" hint="I am the type name to translate" required="yes" type="string" />
		<cfreturn getCFType(arguments.typeName)/>
	</cffunction>

	<cffunction name="setTableMetadata" access="private" output="false" returntype="void">
		<cfset var qTable = "" />
		<!--- get table column info --->
		<!--- This is a modified version of the query in sp_columns --->
		<cfquery name="qTable" datasource="#variables.dsn#">
			SELECT lower(col.COLUMN_NAME) as COLUMN_NAME,
                  /* Oracle has no equivalent to autoincrement or  identity */
                  'false'                     AS "IDENTITY",
                  CASE
                        WHEN col.NULLABLE = 'Y' AND col.DATA_DEFAULT IS NULL THEN 1 /* a column is defined as nullable only if it doesn't have a default */
                        ELSE 0
                  END                  as NULLABLE,
                 col.DATA_TYPE         as TYPE_NAME,
                  case
                    /* 26 is the length of now() in ColdFusion (i.e. {ts '2006-06-26 13:10:14'})*/
                    when col.data_type = 'DATE'   then 26
                    else col.data_length
                  end                 as length,
                  col.DATA_DEFAULT      as "DEFAULT"
            FROM  all_tab_columns   col,
                  ( select  colCon.column_name,
                 			  colcon.table_name
                  from    all_cons_columns  colCon,
                         all_constraints   tabCon
                  where tabCon.table_name = <cfqueryparam cfsqltype="cf_sql_varchar" maxlength="128" value="#variables.table#" />
                       AND colCon.CONSTRAINT_NAME = tabCon.CONSTRAINT_NAME
                       AND colCon.TABLE_NAME      = tabCon.TABLE_NAME
                       AND 'P'                    = tabCon.CONSTRAINT_TYPE
                 ) primaryConstraints
            where col.table_name = <cfqueryparam cfsqltype="cf_sql_varchar" maxlength="128" value="#variables.table#" />
            		and col.COLUMN_NAME        = primaryConstraints.COLUMN_NAME (+)
                  AND col.TABLE_NAME       = primaryConstraints.TABLE_NAME (+)
        	order by col.column_id
		</cfquery>
		<cfset variables.tableMetadata = qTable />
	</cffunction>
	

	<cffunction name="setPrimaryKeyList" access="private" output="false" returntype="void">
		<cfset var qPrimaryKeys = "" />
		<cfset var lstPrimaryKeys = "" />
		<cfquery name="qPrimaryKeys" datasource="#variables.dsn#">
			select    colCon.column_name,
					colcon.CONSTRAINT_NAME  AS PK_NAME
			from    user_cons_columns  colCon,
					user_constraints   tabCon
			where tabCon.table_name = <cfqueryparam cfsqltype="cf_sql_varchar" maxlength="128" value="#variables.table#" />
			AND colCon.CONSTRAINT_NAME = tabCon.CONSTRAINT_NAME
			AND colCon.TABLE_NAME      = tabCon.TABLE_NAME
			AND 'P'                    = tabCon.CONSTRAINT_TYPE
			order by colcon.POSITION
		</cfquery>
		<cfset lstPrimaryKeys = valueList(qPrimaryKeys.column_name) />
		<cfset variables.primaryKeyList = lstPrimaryKeys />
	</cffunction>
	

	
</cfcomponent>