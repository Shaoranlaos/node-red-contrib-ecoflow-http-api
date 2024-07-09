module.exports = function(RED) {
    
    const ecoflowAPI = require("./ecoflow-api");

    function queryEcoflowApi(config) {
        RED.nodes.createNode(this,config);

        var node = this;
        var ak = node.credentials.access_key;
        var sk = node.credentials.secret_key;
        var sn = node.serial_number;

        ecoflowAPI.init(ak,sk);
        
        node.on('input', function(msg) {
            msg.payload = queryQuotaAll(msg.payload == undefined ? sn : msg.payload);
            node.send(msg);
        });
    }

    RED.nodes.registerType("ecoflow-api", queryEcoflowApi);
}