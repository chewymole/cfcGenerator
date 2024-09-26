component {
    public void function init(required any app) {
        variables.app = arguments.app;
    }

    public void function handleRequest() {
        var allowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"]; // Add your Vue.js dev server URL
        var origin = cgi.http_origin;

        if (arrayFind(allowedOrigins, origin) OR origin CONTAINS "localhost") {
            cfheader(name="Access-Control-Allow-Origin", value=origin);
        } else {
            cfheader(name="Access-Control-Allow-Origin", value="http://localhost:5173"); // Default to your Vue.js dev server
        }

        cfheader(name="Access-Control-Allow-Methods", value="GET,POST,PUT,DELETE,OPTIONS");
        cfheader(name="Access-Control-Allow-Headers", value="Content-Type");
        cfheader(name="Access-Control-Allow-Credentials", value="true");
        
        if (cgi.request_method == "OPTIONS") {
            cfheader(statuscode="204");
            cfabort;
        }
    }
}