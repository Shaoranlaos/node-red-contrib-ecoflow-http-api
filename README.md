# Ecoflow Node Red module

A Node Red module that allows to use the offical Ecoflow HTTP API to read data from various supported Ecoflow devices.

At the moment the following functions are supported:
- List devices
- Query all data of a device
- Query specifc datapoints of a device

## Supported device types

Because this module uses the standard HTTP API from Ecoflow it should support all devices that are also supported from the offical API.

But it is only tested with the following devices:
- Powerstream
- Delta Max
- Smart Plug

## Node "Ecoflow API"

The node can be configured with the official credentials gotten from [Ecoflow OpenIoT](https://developer-eu.ecoflow.com).

It has the following functions:

### query the device list

This simply return a list of all devices that are registered with the used account and gives there product name, custom name, serial number and online status.
It takes no inputs.

```
[
    {
        "sn":"DAEBF11111111",
        "deviceName":"Test Device",
        "online":1,
        "productName":"DELTA Max"
    },
    ...
]
```

### query all data of a device

The returns all data that can be queried for a specific device. It needs the serial number of the device as input.

This serial number is read from the node configuration or the incoming message in the following priority:
1. node configuration (Serial Number field)
2. msg.sn
3. msg.payload

It returns the queried data as a json object in the message payload.

Example for data from a smart plug:
```
{
    "2_1.freq":50,
    "2_1.mqttErrTime":1722171847,
    "2_1.volt":238,
    "2_1.geneWatt":0,
    ...
}
```

The details of the structure and content can be read under [Ecoflow API Documentation](https://developer-eu.ecoflow.com/us/document/generalInfo).

### query specific datapoints

This works similar to the previous function but will only query requested datapoint for a device.
The datapoints must be inputed via an array in the payload of the incoming message.

Example datapoints definition: `["20_1.invOutputWatts","20_1.invDemandWatts"]`

## Getting Access Key and Secret Key

The Credentials can be requested on the offical Ecoflow IoT Website: [Ecoflow OpenIoT](https://developer-eu.ecoflow.com).
It can take up to a week for the account to be enabled.