component accessors=true {

    property name="name" type="string";
    property name="dbType" type="string";
    property name="schema" type="string";
    property name="dbms" type="any";

    public any function init(required string datasourceName) {
        variables.name = arguments.datasourceName;
        variables.dbType = determineDBType();
        variables.schema = determineSchema();
        variables.dbms = createObject("component","#variables.dbType#").init(variables.name);
        return this;
    }


    private string function determineDBType() {
        try {
            var q = new Query(datasource=variables.name);
            
            // MySQL
            try {
                q.setSQL("SHOW VARIABLES LIKE '%version%'");
                var result = q.execute().getResult();
                for (var row in result) {
                    if (row.Variable_name == "version_comment" || row.Variable_name == "innodb_version") {
                        if (find("mysql", lCase(row.Value))) {
                            return "mysql";
                        }
                    }
                }
            } catch (any e) {
                // Not MySQL, continue to next check
            }
            
            // Microsoft SQL Server
            try {
                q.setSQL("SELECT @@version AS version");
                var result = q.execute().getResult();
                if (find("microsoft", lCase(result.version))) return "mssql";
            } catch (any e) {
                // Not SQL Server, continue to next check
            }
            
            // PostgreSQL
            try {
                q.setSQL("SELECT version() AS version");
                var result = q.execute().getResult();
                if (find("postgresql", lCase(result.version))) return "postgresql";
            } catch (any e) {
                // Not PostgreSQL, continue to next check
            }
            
            // Oracle
            try {
                q.setSQL("SELECT banner AS version FROM v$version WHERE rownum = 1");
                var result = q.execute().getResult();
                if (find("oracle", lCase(result.version))) return "oracle";
            } catch (any e) {
                // Not Oracle, continue to next check
            }
            
            // If we still can't determine the type, throw an error
            throw("Unable to determine database type");
        }
        catch (any e) {
            writeLog(file="codeGenerator", type="error", text="Error determining database type: #e.message# #e.detail#");
            rethrow;
        }
    }

    private string function determineSchema() {
        var q = new Query(datasource=variables.name);
        switch(variables.dbType) {
            case "mysql":
                q.setSQL("SELECT DATABASE() AS current_schema");
                var result = q.execute().getResult();
                return result.current_schema;
            case "mssql":
                q.setSQL("SELECT SCHEMA_NAME()");
                var result = q.execute().getResult();
                return result[''][1];
            // Add cases for other database types as needed
            default:
                return "";
        }
    }

}