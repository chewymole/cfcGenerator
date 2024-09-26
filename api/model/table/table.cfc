component accessors=true {

    property name="dsn" type="any";
    property name="name" type="string";
    property name="columns" type="array";

    public any function init() {
        return this;
    }


    public any function build(required any dsn, required string tableName) {
        setdsn(arguments.dsn);
        setName(arguments.tableName);
        setColumns(get_columns());
        //writeLog(file="codeGenerator", type="information", text="Initialized table: #tableName# with #arrayLen(variables.columns)# columns");
        return this;
    }


    public string function toXML() {
        var xml = '<table name="#xmlFormat(getName())#">';
        for (var column in getColumns()) {
            xml &= '<column name="#xmlFormat(column.name)#" type="#xmlFormat(column.type)#" />';
        }
        xml &= '</table>';
        writeLog(file="codeGenerator", type="information", text="Generated XML for table: #variables.name#");
        return xml;
    }

    private array function get_columns() {
        var query = new Query(datasource=getDSN().getName());
        switch(getDSN().getDBType()) {
            case "mysql":
                query.setSQL("
                    select column_name,data_type,is_nullable, column_default, column_key
                    from INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_SCHEMA = :schema AND TABLE_NAME = :tableName
                    order by ordinal_position                    
                ");
                break;
            // ... other cases ...
        }
        query.addParam(name="schema", value=getDSN().getSchema(), cfsqltype="cf_sql_varchar");
        query.addParam(name="tableName", value=getname(), cfsqltype="cf_sql_varchar");
        var result = query.execute().getResult();
        
        writeLog(file="codeGenerator", type="information", text="Column query result for table #variables.name#: #serializeJSON(result)#");
        
        var columns = [];
        for (var row in result) {
            arrayAppend(columns, {
                name: row.COLUMN_NAME, 
                type: row.DATA_TYPE,
                isNullable: row.IS_NULLABLE,
                defaultValue: row.COLUMN_DEFAULT,
                columnKey: row.COLUMN_KEY
            });
        }
        return columns;
    }

}