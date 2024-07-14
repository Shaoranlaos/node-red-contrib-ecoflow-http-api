module.exports = function(RED) {    

    function queryEcoflowApi(config) {
        RED.nodes.createNode(this,config);

        let node = this;

        let fn = config.function;
        let sn = config.serial_number;

        let server = RED.nodes.getNode(config.remote);

        node.on('input', async function(msg, send, done) {

            let func = fn ? fn : msg.function;
            let serialNumber = sn ? sn : msg.sn ? msg.sn : msg.payload;

            outFunc = function(data) {
                
            }

            switch(func) {
                case 'queryQuotaAll':
                    [data,error] = await server.queryQuotaAll(serialNumber);
                    break;
                case 'deviceList':
                    [data,error] = await server.queryDeviceList();
                    break;
            }

            if (data) {
                msg.payload = data;
                send(msg);
                done();
            } else {
                done(error);
            }
        });
    }

    RED.nodes.registerType("ecoflow-api", queryEcoflowApi);
}