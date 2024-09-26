component extends="taffy.core.resource" taffy_uri="/datasources" {

    function post(string datasourceName = "") {
        if (len(trim(datasourceName)) == 0) {
            return representationOf({
                "success": false,
                "message": "Datasource name is required"
            }).withStatus(400);
        }

        try {
            // Attempt to create a query with the given datasource
            var q = new Query(datasource=datasourceName);
            q.execute(sql="SELECT 1");
            
            return representationOf({
                "success": true,
                "message": "Datasource validated successfully"
            });
        } catch (any e) {
            return representationOf({
                "success": false,
                "message": "Failed to validate datasource: " & e.message
            }).withStatus(500);
        }
    }

}