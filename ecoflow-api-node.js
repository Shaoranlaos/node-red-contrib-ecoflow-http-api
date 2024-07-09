module.exports = function(RED) {
    
    const ecoflowAPI = require("./ecoflow-api");

    function queryEcoflowApi(config) {
        RED.nodes.createNode(this,config);

        var node = this;
        var ak = node.credentials.access_key;
        var sk = node.credentials.secret_key;
        var sn = config.serial_number;

        ecoflowAPI.init(ak,sk);
        
        node.on('input', function(msg) {
            ecoflowAPI.queryQuotaAll(sn ? sn : msg.payload, function (data) {
                msg.payload = data;
                node.send(msg);
            });
        });
    }

    RED.nodes.registerType("ecoflow-api", queryEcoflowApi, {
        credentials: {
            access_key: {type:"text"},
            secret_key: {type:"password"}
        }});
}