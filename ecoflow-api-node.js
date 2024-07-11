module.exports = function(RED) {
    
    const ecoflowAPI = require("./ecoflow-api");

    

    function queryEcoflowApi(config) {
        RED.nodes.createNode(this,config);

        var node = this;

        var ak = node.credentials.access_key;
        var sk = node.credentials.secret_key;
        var fn = config.function;
        var sn = config.serial_number;

        ecoflowAPI.init(ak,sk);

        node.on('input', function(msg) {

            var func = fn ? fn : msg.function;
            var serialNumber = sn ? sn : msg.sn ? msg.sn : msg.payload;

            outFunc = function(data) {
                msg.payload = data;
                node.send(msg);
            }

            switch(func) {
                case 'queryQuotaAll':
                    ecoflowAPI.queryQuotaAll(serialNumber, outFunc);
                    break;
                case 'deviceList':
                    ecoflowAPI.queryDeviceList(outFunc);
                    break;
            }
        });
    }

    RED.nodes.registerType("ecoflow-api", queryEcoflowApi, {
        credentials: {
            access_key: { type: "text" },
            secret_key: { type: "password" }
        }});
}