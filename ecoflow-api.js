module.exports = function(RED) {
    
    function RemoteServerNode(n) {
        RED.nodes.createNode(this,n);

        let node = this;

        let ecoflowApiServer = n.server;
        let accessKey = node.credentials.access_key;
        let secretKey = node.credentials.secret_key;

        const ecoflow = require("@ecoflow-api/rest-client");

        const client = new ecoflow.RestClient({
            accessKey: accessKey,
            secretKey: secretKey,
            host: ecoflowApiServer,
        });

        node.queryQuotaAll = function(sn) {
            return client.getDevicePropertiesPlain(sn);
        }
        node.queryDeviceList = function() {
            return client.getDevicesPlain();
        }
        node.setQuotaSelective = function(sn, values) {
            return client.setCommandPlain({sn: sn, ...values });
        }
        node.queryMqttCert =  function(sn) {
            return client.getMqttCredentials();
        }
    }

    RED.nodes.registerType("ecoflow-api-server", RemoteServerNode, {
        credentials: {
            access_key: { type: "text" },
            secret_key: { type: "password" }
        }});

}
