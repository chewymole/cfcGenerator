component {

    public array function getTables(required any datasource) {
        var dbType = arguments.datasource.getDBType();
        var tables = [];
        
        switch(dbType) {
            case "mysql":
                tables = getMySQLTables(arguments.datasource);
                break;
            // ... other cases ...
            default:
                throw("Unsupported database type: " & dbType);
        }
        
        return tables;
    }

    public string function getTablesXML(required array tables) {
        var xmlString = "<tables>";
        for (var table in arguments.tables) {
            xmlString &= table.toXML();
        }
        xmlString &= "</tables>";
        return xmlString;
    }

    private array function getMySQLTables(required any datasource) {
        var query = new Query();
        query.setDatasource(arguments.datasource.getName());
        var sql = "
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = :schema AND TABLE_TYPE = 'BASE TABLE'
        ";
        query.setSQL(sql);
        query.addParam(name="schema", value=arguments.datasource.getSchema(), cfsqltype="cf_sql_varchar");
        
        var debugInfo = {
            sql: sql,
            schema: arguments.datasource.getSchema(),
            datasourceName: arguments.datasource.getName()
        };
        
        try {
            var result = query.execute().getResult();
            debugInfo['queryResult'] = result;
            debugInfo['recordCount'] = result.recordCount;
        } catch (any e) {
            debugInfo['error'] = {
                message: e.message,
                detail: e.detail
            };
            throw(
                type="CustomError",
                message="Error executing query",
                detail=serializeJSON(debugInfo)
            );
        }
        
        var tables = [];
        for (var row in result) {
            arrayAppend(tables, new table.table(arguments.datasource, row.TABLE_NAME));
        }
        
        debugInfo['tablesCount'] = arrayLen(tables);
        
        if (arrayLen(tables) == 0) {
            throw(
                type="CustomError",
                message="No tables found",
                detail=serializeJSON(debugInfo)
            );
        }
        
        return tables;
    }

    private array function getMSSQLTables(required any datasource) {
        var query = new Query();
        query.setDatasource(arguments.datasource.getName());
        query.setSQL("
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = :schema AND TABLE_TYPE = 'BASE TABLE'
        ");
        query.addParam(name="schema", value=arguments.datasource.getSchema(), cfsqltype="cf_sql_varchar");
        var result = query.execute().getResult();
        
        var tables = [];
        for (var row in result) {
            arrayAppend(tables, new model.table.table(arguments.datasource, row.TABLE_NAME));
        }
        return tables;
    }

    private array function getPostgreSQLTables(required any datasource) {
        // Implement logic to fetch tables from PostgreSQL database
    }

    private array function getOracleTables(required any datasource) {
        // Implement logic to fetch tables from Oracle database
    }

}