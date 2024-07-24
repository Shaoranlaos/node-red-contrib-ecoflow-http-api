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
            let quotaTypes = msg.payload;

            let data, error;
            switch(func) {
                case 'queryQuotaAll':
                    [data,error] = await server.queryQuotaAll(serialNumber);
                    break;
                case 'deviceList':
                    [data,error] = await server.queryDeviceList();
                    break;
                case 'queryQuotaSelective':
                    node.debug(quotaTypes);
                    if (getType(quotaTypes) != 'Array') {
                        error = "msg.payload is not an array!";
                    } else {
                        [data,error] = await server.queryQuotaSelective(serialNumber,quotaTypes);
                    }
                    break;
            }

            if (data) {
                msg.payload = data;
                send(msg);
                done();
            } else {
                //send(msg);
                done(error);
            }
        });
    }

    RED.nodes.registerType("ecoflow-api", queryEcoflowApi);

    const getType = obj => Object.prototype.toString.call(obj).slice(8, -1);
}