component extends="taffy.core.api" {
    this.name = "CodeGeneratorAPI";
    
    variables.framework = {
        reloadOnEveryRequest = false,
        unhandledPaths = "/flex,/cfide,/cf_scripts",
        allowCrossDomain = false
    };

    function onApplicationStart() {
        application.cors = new CORS(this);
        application.tableList = {};
        return super.onApplicationStart();
    }

    function onRequestStart(string targetPath) {
        application.cors.handleRequest();
        cfsetting( requestTimeout = 180 );
        return super.onRequestStart(arguments.targetPath);
    }
}