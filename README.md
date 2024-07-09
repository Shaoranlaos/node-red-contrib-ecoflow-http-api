# Ecoflow Node Red module

A Node Red module that allows to use the offical Ecoflow HTTP API to read data from
various supported Ecoflow Devices.

The used HTTP endpoint is "/iot-open/sign/device/quota/all" which will get all available data for the
requested device.

## Supported device types

Because this module uses the standard HTTP API from Ecoflow it should support all
devices that are also supported from the offical API.

## Node "Ecoflow API"

The node can be configured with the official credentials gotten from [Ecoflow OpenIoT](https://developer-eu.ecoflow.com).
It has two modes:
1. It can work with a static Serial Number of a device and every time a message is received the payload
of the message is replaced with the data requested via the API.
2. It can receive a Serial Number of a device in the payload of the incoming message and it will then
request the information for this device and replace the message.payload with it.

### Output message types

The output is formated as JSON.
The details of the structure can be read under [Ecoflow API Documentation](https://developer-eu.ecoflow.com/us/document/generalInfo).

## Getting Access Key and Secret Key

The Credentials can be requested on the offical Ecoflow IoT Website: [Ecoflow OpenIoT](https://developer-eu.ecoflow.com).
It can take up to a week for the account to be enabled.