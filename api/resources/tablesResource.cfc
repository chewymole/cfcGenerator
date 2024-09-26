component extends="taffy.core.resource" taffy_uri="/tables" {

    function get(string datasourceName = "", string tableName = "") {
        if (len(trim(datasourceName)) == 0) {
            return representationOf({
                "success": false,
                "message": "Datasource name is required"
            }).withStatus(404);
        }

        try {
            var tables = [];
            var tableList = [];
            var dsObj = new model.datasource.datasource(datasourceName);
            var dbType = dsObj.getDBType();
            var dbms = dsObj.getDBMS();
            //var tableObject = new model.table.table();

            if (len(trim(arguments.tableName))) {
                arrayAppend(tableList,arguments.tableName);
            } else {
                switch (dbType) {
                    case "mysql":
                        tableList = getMySQLTables(datasourceName);
                    break;
                // Add cases for other database types as needed
                default:
                    throw("Unsupported database type: " & dbType);
                }
            }
            
            if (arrayLen(tableList)) {
                for (var t in tableList) {
                    dbms.setTable(t);
                    dbms.setComponentPath("model." & t);                    
                    arrayappend(tables, dbms.getTableXML());
                    //writeDump(tmp);
                }
                //abort;
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
}