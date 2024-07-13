module.exports = function(RED) {    

    function queryEcoflowApi(config) {
        RED.nodes.createNode(this,config);

        var node = this;

        var fn = config.function;
        var sn = config.serial_number;

        var server = RED.nodes.getNode(config.remote);

        node.on('input', function(msg) {

            var func = fn ? fn : msg.function;
            var serialNumber = sn ? sn : msg.sn ? msg.sn : msg.payload;

            outFunc = function(data) {
                msg.payload = data;
                node.send(msg);
            }

            switch(func) {
                case 'queryQuotaAll':
                    server.queryQuotaAll(serialNumber, outFunc);
                    break;
                case 'deviceList':
                    server.queryDeviceList(outFunc);
                    break;
            }
        });
    }

    RED.nodes.registerType("ecoflow-api", queryEcoflowApi);
}