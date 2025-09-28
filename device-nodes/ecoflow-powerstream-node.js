module.exports = function(RED) {    

    function queryEcoflowApi(config) {
        RED.nodes.createNode(this,config);

        let node = this;

        // Retrieve the function to execute
        let fn = config.function;

        // Get the server node
        let server = RED.nodes.getNode(config.remote);
        if (!server) {
            node.status({ fill: "red", shape: "ring", text: "No server configured" });
            throw new Error("No server configured");
        }

        // Get the specific device
        let dev = server.getSpecificDevice(config.serial_number);
        
        // Check if device is defined
        if (!dev) {
            node.status({ fill: "red", shape: "ring", text: "Device not found" });
            throw new Error("Device not found. Please check the serial number.");
        }

        // Handle input messages
        node.on('input', async function(msg, send, done) {

            let data;

            // Indicate processing
            node.status({ fill: "blue", shape: "dot", text: "Processing..." });

            try {
                // Execute function based on configuration
                switch(fn) {
                    // Retrieve all data of the Powerstream
                    case 'queryAllData':
                        data = await dev.getProperties();
                        break;

                    // Set a specific permanent output value
                    case 'setPermanentOutput':
                        if (typeof msg.payload !== 'number' || msg.payload <= 0) {
                            throw new Error("msg.payload must be a positive number indicating the power in Watts to set the output to");
                        }
                        if (msg.payload > 600) {
                            node.warn("The Powerstream supports a maximum of 600W output. Setting a higher value may lead to unexpected behavior.");
                        }
                        await dev.setCustomLoadPower(msg.payload);
                        break;
                    
                    // Set the supply priority (either "powerSupply" or "battery")
                    case 'setSupplyPriority':
                        if (msg.payload !== "powerSupply" && msg.payload !== "battery") {
                            throw new Error("msg.payload must be either 'powerSupply' or 'battery'");
                        }
                        await dev.setPowerSupplyPriority(msg.payload);
                        break;
                }

                // Handle the response
                if (data) {
                    // Return the retrieved data
                    msg.payload = data;
                    send(msg);
                    
                    node.status({ fill: "green", shape: "dot", text: "Success" });
                    done();

                } else if (fn === 'setSupplyPriority' || fn === 'setPermanentOutput') {
                    // No data returned for setSupplyPriority and setPermanentOutput,
                    // just return success if no error was thrown
                    msg.payload = { success: true };
                    send(msg);

                    node.status({ fill: "green", shape: "dot", text: "Success" });
                    done();

                } else {
                    node.status({ fill: "red", shape: "ring", text: "No data" });
                    done(new Error("No data received from device"));
                }

            } catch (error) {
                node.status({ fill: "red", shape: "ring", text: "Error" });
                done(error);
            }
        });
    }

    RED.nodes.registerType("ecoflow-powerstream", queryEcoflowApi);
}