component extends="taffy.core.api" {
    this.name = "CodeGeneratorAPI";
    
    variables.framework = {
        reloadOnEveryRequest = true,
        unhandledPaths = "/flex,/cfide,/cf_scripts",
        allowCrossDomain = false
    };

    function onApplicationStart() {
        application.cors = new CORS(this);
        return super.onApplicationStart();
    }

    function onRequestStart(string targetPath) {
        application.cors.handleRequest();
        return super.onRequestStart(arguments.targetPath);
    }
}