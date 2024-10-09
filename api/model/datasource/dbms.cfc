<cfcomponent accessors=true name="dbms">
    <cfproperty name="dsn"/>
    <cfproperty name="dbtype"/>
    <cfproperty name="ComponentPath"/>
    <cfproperty name="tableMetadata"/>
    <cfproperty name="primaryKeyList"/>
    <cfproperty name="tableArray"/>
    <cfproperty name="table"/>
    <cfproperty name="schema"/>
    <cfproperty name="sqlTypes"/>
    <cfproperty name="cfTypes"/>

    <cffunction name="init" hint="init the base dbms obj">
        <cfargument name="_dsn" required="true" type="string" hint="the DSN to work with"/>
        <cfargument name="_dbtype" required="true" type="string" hint="the DBMS Name to work with"/>
        <cfset variables.dsn = arguments._dsn/>
        <cfset variables.dbtype = arguments._dbtype/>
        <cfset _sqlType(arguments._dbtype)/>
        <cfset _cfType(arguments._dbtype)/>
        <cfreturn this/>
    </cffunction>


    <cffunction name="getTableXML" access="public" output="false" returntype="xml">
		<cfset var xmlTable = "" />
		<!--- convert the table data into an xml format --->
		<!--- added listfirst to the sql_type because identity is sometimes appended --->
		<cfxml variable="xmlTable">
		<cfoutput>
		<root>
			<bean name="#listLast(variables.componentPath,'.')#" path="#variables.componentPath#">
				<dbtable name="#variables.table#" type="#variables.dbtype#" dsn="#variables.dsn#">
				<cfloop query="variables.tableMetadata">
					<column name="#variables.tableMetadata.column_name#"
							type="<cfif variables.tableMetadata.type_name EQ 'char' AND variables.tableMetadata.length EQ 35 AND listFind(variables.primaryKeyList,variables.tableMetadata.column_name)>uuid<cfelse>#translateDataType(listFirst(variables.tableMetadata.type_name," "))#</cfif>"
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


    <cffunction name="getSQLType" access="public" returntype="string" hint="returns the CF SQL type based on dbms and column data type">
        <cfargument name="dtype" required="true" type="string"/>
        <cfset var ret = variables.sqlTypes[arguments.dtype]/>
        <cfif not isNull(ret)>
            <cfreturn ret/>
        <cfelse>
            <cfthrow message="Unsupported data type conversion" type="data_type_conversion"/>
        </cfif>
    </cffunction>

    <cffunction name="getCFType" access="public" returntype="string" hint="returns the CF data type based on the dbms and column data type">
        <cfargument name="dtype" required="true" type="string"/>
        <cfset var ret = variables.cfTypes[arguments.dtype]/>
        <cfif not isNull(ret)>
            <cfreturn ret/>
        <cfelse>
            <cfthrow message="Unsupported data type conversion" type="data_type_conversion"/>
        </cfif>
    </cffunction>

    <cffunction name="_sqlType" access="private">
        <cfargument name="_dbtype" required="true" type="string"/>
        <cfscript>
            var o = {
                "informix" = {
                    "0"="cf_sql_char",
                    "1"="cf_sql_smallint",
                    "2"="cf_sql_integer",
                    "3"="cf_sql_float",
                    "4"="cf_sql_float",
                    "5"="cf_sql_decimal",
                    "6"="cf_sql_integer",
                    "7"="cf_sql_date",
                    "8"="cf_sql_money",
                    "10"="cf_sql_timestamp",
                    "13"="cf_sql_varchar",
                    "40"="cf_sql_longvarchar",
                    "41"="cf_sql_longvarchar",
                    "262"="cf_sql_serial"
                },
                "mssql" = {
                    "bigint"="cf_sql_bigint",
                    "binary"="cf_sql_binary",
                    "bit"="cf_sql_bit",
                    "char"="cf_sql_char",
                    "date"="cf_sql_date",
                    "datetime"="cf_sql_timestamp",
                    "decimal"="cf_sql_decimal",
                    "float"="cf_sql_float",
                    "image"="cf_sql_longvarbinary",
                    "int"="cf_sql_integer",
                    "money"="cf_sql_money",
                    "nchar"="cf_sql_char",
                    "ntext"="cf_sql_longvarchar",
                    "numeric"="cf_sql_numeric",
                    "nvarchar"="cf_sql_varchar",
                    "real"="cf_sql_real",
                    "smalldatetime"="cf_sql_timestamp",
                    "smallint"="cf_sql_smallint",
                    "smallmoney"="cf_sql_decimal",
                    "text"="cf_sql_longvarchar",
                    "timestamp"="cf_sql_timestamp",
                    "tinyint"="cf_sql_tinyint",
                    "uniqueidentifier"="cf_sql_idstamp",
                    "varbinary"="cf_sql_varbinary",
                    "varchar"="cf_sql_varchar",
                    "xml"="cf_sql_longvarchar",
                    "sql_variant"="cf_sql_varchar"
                },
                "mysql" = {
                    "bigint"="cf_sql_bigint",
                    "binary"="cf_sql_binary",
                    "bit"="cf_sql_bit",
                    "char"="cf_sql_char",
                    "datetime"="cf_sql_timestamp",
                    "decimal"="cf_sql_decimal",
                    "double"="cf_sql_numeric",
                    "float"="cf_sql_float",
                    "image"="cf_sql_longvarbinary",
                    "int"="cf_sql_integer",
                    "money"="cf_sql_money",
                    "nchar"="cf_sql_char",
                    "ntext"="cf_sql_longvarchar",
                    "numeric"="cf_sql_varchar",
                    "nvarchar"="cf_sql_varchar",
                    "longtext"="cf_sql_longvarchar",
                    "real"="cf_sql_real",
                    "smalldatetime"="cf_sql_date",
                    "smallint"="cf_sql_smallint",
                    "smallmoney"="cf_sql_decimal",
                    "text"="cf_sql_longvarchar",
                    "timestamp"="cf_sql_timestamp",
                    "tinyint"="cf_sql_tinyint",
                    "uniqueidentifier"="cf_sql_idstamp",
                    "varbinary"="cf_sql_varbinary",
                    "varchar"="cf_sql_varchar"
                },
                "oracle" = {
                    "rowid"="cf_sql_varchar",
                    "date"="cf_sql_timestamp",
                    "timestamp(6)"="cf_sql_date",
                    "char"="cf_sql_char",
                    "nchar"="cf_sql_char",
                    "varchar"="cf_sql_varchar",
                    "varchar2"="cf_sql_varchar",
                    "nvarchar2"="cf_sql_varchar",
                    "blob"="cf_sql_blob",
                    "clob"="cf_sql_clob",
                    "nclob"="cf_sql_clob",
                    "long"="cf_sql_longvarchar",
                    "long raw"="cf_sql_longvarbinary",
                    "raw"="cf_sql_varbinary",
                    "float"="cf_sql_float",
                    "integer"="cf_sql_numeric",
                    "number"="cf_sql_numeric",
                    "real"="cf_sql_numeric"
                },
                "postgresql" = {
                    "date"="cf_sql_timestamp",
                    "timestamp"="cf_sql_timestamp",
                    "bit"="cf_sql_bit",
                    "bool,boolean"="cf_sql_varchar",
                    "oid"="cf_sql_integer",
                    "smallint"="cf_sql_smallint",
                    "integer"="cf_sql_integer",
                    "int"="cf_sql_integer",
                    "serial"="cf_sql_integer",
                    "bigint"="cf_sql_bigint",
                    "bigserial"="cf_sql_bigint",
                    "numeric"="cf_sql_numeric",
                    "smallmoney"="cf_sql_numeric",
                    "money"="cf_sql_numeric",
                    "real"="cf_sql_real",
                    "decimal"="cf_sql_decimal",
                    "double precision"="cf_sql_decimal",
                    "float"="cf_sql_decimal",
                    "bytea"="cf_sql_binary",
                    "char"="cf_sql_char",
                    "character"="cf_sql_char",
                    "varchar"="cf_sql_varchar",
                    "character varying"="cf_sql_varchar",
                    "text"="cf_sql_longvarchar"
                }
            }
            variables.sqlTypes = o[arguments._dbtype];
        </cfscript>
    </cffunction>

    <cffunction name="_cfType" access="private">
        <cfargument name="_dbtype" required="true" type="string"/>
        <cfscript>
            var o = {                
                "mysql"= {
                    "bigint"="numeric",
                    "binary"="string",
                    "bit"="boolean",
                    "char"="string",
                    "datetime"="date",
                    "decimal"="numeric",
                    "double"="numeric",
                    "float"="numeric",
                    "image"="numeric",
                    "int"="numeric",
                    "money"="numeric",
                    "nchar"="string",
                    "ntext"="string",
                    "numeric"="numeric",
                    "nvarchar"="ntring",
                    "longtext"="string",
                    "real"="numeric",
                    "smalldatetime"="date",
                    "smallint"="numeric",
                    "smallmoney"="numeric",
                    "text"="string",
                    "timestamp"="date",
                    "tinyint"="boolean",
                    "uniqueidentifier"="string",
                    "varbinary"="string",
                    "varchar"="string"
                },
                "postgresql"= {
                    "smallint"="numeric",
                    "int"="numeric",
                    "integer"="numeric",
                    "bigint"="numeric",
                    "serial"="numeric",
                    "bigserial"="numeric",
                    "bytea"="string",
                    "bit"="boolean",
                    "bool"="boolean",
                    "boolean"="boolean",
                    "char"="string",
                    "character"="string",
                    "varchar"="string",
                    "varying character"="string",
                    "text"="string",
                    "date"="date",
                    "time"="date",
                    "timestamp"="date",
                    "real"="numeric",
                    "numeric"="numeric",
                    "money"="numeric",
                    "float"="numeric",
                    "double"="numeric",
                    "decimal"="numeric"
                },
                "oracle"={
                    "rowid"="string",
                    "date"="date",
                    "timestamp(6)"="date",
                    "char"="string",
                    "nchar"="string",
                    "varchar"="string",
                    "varchar2"="string",
                    "nvarchar2"="string",
                    "blob"="binary",
                    "clob"="string",
                    "nclob"="string",
                    "long"="string",
                    "long raw"="binary",
                    "raw"="binary",
                    "float"="numeric",
                    "integer"="numeric",
                    "number"="numeric",
                    "real"="numeric"
                },
                "mssql"={
                    "bigint"="numeric",
                    "binary"="binary",
                    "bit"="boolean",
                    "char"="string",
                    "date"="date",
                    "datetime"="date",
                    "decimal"="numeric",
                    "float"="numeric",
                    "image"="binary",
                    "int"="numeric",
                    "money"="numeric",
                    "nchar"="string",
                    "ntext"="string",
                    "numeric"="numeric",
                    "nvarchar"="string",
                    "real"="numeric",
                    "smalldatetime"="date",
                    "smallint"="numeric",
                    "smallmoney"="numeric",
                    "text"="string",
                    "timestamp"="numeric",
                    "tinyint"="numeric",
                    "uniqueidentifier"="string",
                    "varbinary"="binary",
                    "varchar"="string",
                    "xml"="string",
                    "sql_variant"="string"
                },
                "informix"={
                    "0"="string",
                    "1"="numeric",
                    "2"="numeric",
                    "3"="numeric",
                    "4"="numeric",
                    "5"="numeric",
                    "6"="numeric",
                    "7"="date",
                    "8"="numeric",
                    "10"="date",
                    "13"="string",
                    "40"="string",
                    "41"="string",
                    "262"="string"
                }
            }
            variables.cfTypes = o[arguments._dbtype];
        </cfscript>
    </cffunction>    
</cfcomponent>