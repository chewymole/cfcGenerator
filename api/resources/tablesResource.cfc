component extends="taffy.core.resource" taffy_uri="/tables" {

    function get(string datasourceName = "", string tableName = "") {
        if (len(trim(datasourceName)) == 0) {
            return representationOf({
                "success": false,
                "message": "Datasource name is required"
            }).withStatus(404);
        }

        try {
            if(!isNull(application?.tableList) 
                and isArray(application?.tableList?.tables)
                and arrayLen(application.tableList.tables)) {
                if(application.tableList.key EQ arguments.datasourceName) {
                    return representationOf({
                        "success": true,
                        "tables": application.tableList.tables,
                        "tableXML": application.tableList.tablesXML
                    });
                }
                
            }


            var tables = [];
            var tableList = [];
            var dsObj = new model.datasource.datasource(datasourceName);
            var dbType = dsObj.getDBType();
            var dbms = dsObj.getDBMS();
            var schema = dsObj.getSchema();
            //var tableObject = new model.table.table();

            if (len(trim(arguments.tableName))) {
                arrayAppend(tableList,arguments.tableName);
            } else {
                switch (dbType) {
                    case "mysql":
                        tableList = getMySQLTables(datasourceName);
                    break;
                    case "mssql":
                        tableList = getMSSQLTables(datasourceName, schema); // dbms.getTables(datasourceName, schema);
                    break;
                    case "oracle":
                        tableList = getOracleTables(datasourceName);
                    break;
                // Add cases for other database types as needed
                default:
                    throw("Unsupported database type: " & dbType);
                }
            }
            
            if (arrayLen(tableList)) {
                tableList.each(function(t) {
                    dbms.setTable(t);
                    dbms.setComponentPath("model." & t);
                    arrayAppend(tables, dbms.getTableXML());
                    return true;
                },true,2);
                
                application.tableList = {
                    "key": arguments.datasourceName,
                    "tables": tableList,
                    "tablesXML": tables
                };
            }

            
            return representationOf({
                "success": true,
                "tables": tablelist,
                "tableXML": tables
            });
        } catch (any e) {
            return representationOf({
                "success": false,
                "message": "Error fetching tables: " & e.message,
                "error": e
            }).withStatus(500);
        }
    }

    private array function getMySQLTables(required string datasourceName) {
        var q = new Query(datasource=arguments.datasourceName);
        q.setSQL("
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE'
        ");
        var result = q.execute().getResult();
        return valueArray(result,"TABLE_NAME");
    }

    private array function getMSSQLTables(required string datasourceName, required string schema) {
        var q = new Query(datasource=arguments.datasourceName, maxrows=200);
        q.setSQL("
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = '#arguments.schema#' AND TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        ");
        var result = q.execute().getResult();
        return valueArray(result,"TABLE_NAME");
    }

    private array function getOracleTables(required string datasourceName) {
        var q = new Query(datasource=arguments.datasourceName);
        q.setSQL("
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE'
        ");
        var result = q.execute().getResult();
        return valueArray(result,"TABLE_NAME");
    }
}