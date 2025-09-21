module.exports = function(RED) {    

    function queryEcoflowApi(config) {
        RED.nodes.createNode(this,config);

        let node = this;

        let fn = config.function;
        let sn = config.serial_number;

        if (fn == "msg") {
            fn = null;
        }

        let server = RED.nodes.getNode(config.remote);

        node.on('input', async function(msg, send, done) {

            let func = fn ? fn : msg.function;
            let serialNumber = sn ? sn : msg.sn ? msg.sn : msg.payload;
            let quotaTypes = msg.payload;


            let data;
            try {
                switch(func) {
                    case 'queryQuotaAll':
                        data = await server.queryQuotaAll(serialNumber);
                        data = data.data;
                        break;
                    case 'deviceList':
                        data = await server.queryDeviceList();
                        data = data.data;
                        break;
                    case 'setQuota':
                        node.debug(quotaTypes);
                        if (getType(quotaTypes) != 'Object') {
                            throw new Error("msg.payload is not an object!");
                        } else {
                            data = await server.setQuotaSelective(serialNumber,quotaTypes);
                            data = data.data;
                        }
                        break;
                    case 'queryMqttCert':
                        data = await server.queryMqttCert();
                        break;
                }

                if (data) {
                    msg.payload = data;
                    send(msg);
                    done();
                }
            } catch (error) {
                done(error);
            }
        });
    }

    RED.nodes.registerType("ecoflow-api", queryEcoflowApi);

    const getType = obj => Object.prototype.toString.call(obj).slice(8, -1);
}