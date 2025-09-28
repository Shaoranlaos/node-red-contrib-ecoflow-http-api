module.exports = function(RED) {    

    function queryEcoflowApi(config) {
        RED.nodes.createNode(this,config);

        let node = this;

        let fn = config.function;

        let server = RED.nodes.getNode(config.remote);
        let dev = server.getSpecificDevice(config.serial_number);

        node.on('input', async function(msg, send, done) {

            let data;
            try {
                switch(fn) {
                    case 'queryAllData':
                        data = await dev.getProperties();
                        break;
                    case 'setPermanentOutput':
                        data = await dev.setCustomLoadPower(msg.payload);
                        break;
                }

                if (data) {
                    msg.payload = data;
                    send(msg);
                    node.status({ fill: "green", shape: "dot", text: "Success" });
                    done();
                } else {
                    throw new Error("No data received from Ecoflow API");
                }

            } catch (error) {
                node.status({ fill: "red", shape: "ring", text: "Error" });
                done(error);
            }
        });
    }

    RED.nodes.registerType("ecoflow-powerstream", queryEcoflowApi);
}