# Ecoflow Node Red module

A Node Red module that allows to use the offical Ecoflow HTTP API to read data from various supported Ecoflow devices.

Big thanks to [@rustyy](https://github.com/rustyy/ecoflow-api) for providing an easy to use javascript library which makes the implementation of the interactions way easier.

At the moment the following functions are supported:
- [List devices](#query-the-device-list)
- [Query all data of a device](#query-all-data-of-a-device)
- [Generic set of data of a device](#set-a-specific-datapoint)
- [Query for the user specific MQTT parameters](#query-mqtt-configuration-parameter)

It also has a specific node for the following device types, to make interaction with the functions of these easier (see the documentation of the nodes for more information):
- PowerStream

## Supported device types

Because this module uses the standard HTTP API from Ecoflow it should support all devices that are also supported from the offical API.

But it is only tested with the following devices:
- Powerstream
- Delta Max (not working as of June 2025 - gives Access error)
- Smart Plug
- STREAM Ultra



## Node "Ecoflow Generic API"

### Ecoflow client configuration (Authentication)

The node can be configured with the official credentials gotten from [Ecoflow OpenIoT](https://developer-eu.ecoflow.com).
See [below](#getting-access-key-and-secret-key) for a bit more information.

### Functions

#### query the device list (deviceList)

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

#### query all data of a device (queryQuotaAll)

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

#### set a specific value (setQuota)

This is a complicated endpoint because the needed JSON for the request various by a lot from device type to device type.
Because of that the endpoint is very generic and almost expects the full json from the official API. Only the serial number must be excluded because this will be set from the serial number set in the node config or from the msg.sn field.

Example:
If the SetCommand for a PowerStream Custom Output expects the following JSON according to the <a href="https://developer-eu.ecoflow.com/us/document/powerStreamMicroInverter">documentation</a>
```
{"sn": "HW513000SF767194","cmdCode": "WN511_SET_PERMANENT_WATTS_PACK","params": {"permanentWatts": 20}}
```
the endpoint expects the following as a json payload on the message
```
{"cmdCode": "WN511_SET_PERMANENT_WATTS_PACK","params": {"permanentWatts": 20}}
```

#### get MQTT connection parameter (queryMqttCert)

This will query the HTTP-API for the needed configuration to use the offical MQTT-API.

Example:
```
{"certificateAccount":"open-...","certificatePassword":"...","url":"mqtt-e.ecoflow.com","port":"8883","protocol":"mqtts"}
```

#### use the msg.function field

This mode allows to use a single node to execute all the above functions.

This is done by setting the `msg.function` field on the incoming message to one of the above named functions (in a shorter naming - see the name in brackets above or the list in the help text of the node) and this is then executed with the data from the incoming message (if addional data is needed).



## Getting Access Key and Secret Key

The Credentials can be requested on the offical Ecoflow IoT Website: [Ecoflow OpenIoT](https://developer-eu.ecoflow.com).

It can take up to a week for the account to be enabled.



## Known "Problems"

1. The API returns the last known values for a device that is offline. Please use the device list function and check the online status of a device bevor using the values (see the example flow "ListDevicesAndQueryThem"). 
2. The online status in the device list can take up to 15 minutes (in my observations) to reflect when a device is offline.
3. In the current version (May 2026) of the API data is only refreshed every 15 minutes when the ecoflow app is not open on any device with the same account. If the app is open the data seems to refresh every second like shown in the app but goes back to every 15 minutes almost immediatly (after a minute or so) after the app is closed.
4. The PowerOcean seems to have a bug where it only reports values in the API if one of the offical Apps for it are open. See [#9](https://github.com/Shaoranlaos/node-red-contrib-ecoflow-http-api/issues/9) for the curent status on this.
4. As of June 2025 the Delta Max gives the error "current device is not allowed to get device info" on requesting data over the API. Only the status is available (via device list).
Offical Response to this issue:
    ```
    Due to previous instances of unauthorized access to product categories still under development by some users, which caused significant issues, we have closed these unofficial access points. As a result, devices that are not officially released are not supported for access. Your Delta Max falls under the category of devices that are not currently supported.
    ```
    Because of this the same error will probably be outputed from all device types that are not listed in the documentation on [Ecoflow OpenIoT Documents](https://developer-eu.ecoflow.com/us/document/).
