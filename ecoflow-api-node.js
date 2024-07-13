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
                if (data) {
                    msg.payload = data;
                    send(msg);
                }
            }

            hasErr = false;
            errFunc = function(error) { hasErr=true; done(error);};
            switch(func) {
                case 'queryQuotaAll':
                    outFunc(await server.queryQuotaAll(serialNumber, errFunc));
                    break;
                case 'deviceList':
                    outFunc(await server.queryDeviceList(errFunc));
                    break;
            }
            if (!hasErr)
                done();
        });
    }

    RED.nodes.registerType("ecoflow-api", queryEcoflowApi);
}