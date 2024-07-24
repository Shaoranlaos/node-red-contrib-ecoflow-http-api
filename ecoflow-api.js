module.exports = function(RED) {

    const axios = require('axios');
    const http  = require('http');

    function RemoteServerNode(n) {
        RED.nodes.createNode(this,n);

        let node = this;

        let ecoflowApiServer = n.server;
        let accessKey = node.credentials.access_key;
        let secretKey = node.credentials.secret_key;

        request = axios.create({
            baseURL: ecoflowApiServer,
            timeout: 5000,
            httpAgent: new http.Agent({ keepAlive: true }),
        });

        async function EcoflowRequest(path, params, method = 'GET', body = {}) {
            if (params||body) {
                params = {...params, ...body};
                sortedParams = getMapFromObject(params);
                node.trace(JSON.stringify(sortedParams));
            } else {
                sortedParams = params;
            }
        
            sortedParams.accessKey = accessKey;
            sortedParams.nonce = generateNonce();
            sortedParams.timestamp = generateTimestamp();
        
            queryParams = toQueryParamMapping(sortedParams);
        
            var header = {
                accessKey: sortedParams.accessKey,
                nonce: sortedParams.nonce,
                timestamp: sortedParams.timestamp,
                sign: hmac(secretKey, queryParams),
            };
            node.trace(ecoflowApiServer+path+'?'+queryParams);

            switch (method) {
                case 'GET':
                    taskReq = request.get(path, { headers:header, params: params });
                    break;
                case 'POST':
                    taskReq = request.post(path, body, { headers:header, params: params });
                    break;
                case 'PUT':
                    taskReq = request.put(path, body, { headers:header, params: params });
                    break;
            }
            return await taskReq
                .then(function (response) {
                    node.debug(response.status);

                    node.debug(response.data);
                    if (response.status == 200 && response.data.data) {
                        return [response.data.data,undefined];
                    } else {
                        return [undefined,response.data]
                    }
                })
                .catch(function(error) {
                    node.error(error);
                    return [undefined,error];
                });
        }

        node.queryQuotaAll = function(sn) {
            return EcoflowRequest("/iot-open/sign/device/quota/all", { sn: sn });
        }
        node.queryDeviceList = function() {
            return EcoflowRequest("/iot-open/sign/device/list", {});
        }
        node.queryQuotaSelective = function(sn, types) {
            return EcoflowRequest("/iot-open/sign/device/quota", {}, 'POST', {sn: sn, params: {cmdSet: 32, id: 66, quotas: types}});
        }
    }

    RED.nodes.registerType("ecoflow-api-server", RemoteServerNode, {
        credentials: {
            access_key: { type: "text" },
            secret_key: { type: "password" }
        }});


    const generateNonce = () => Math.floor(Math.random() * 1000000) + 1;
    const generateTimestamp = () => Date.now();
    const getType = obj => Object.prototype.toString.call(obj).slice(8, -1);

    function toQueryParamMapping(params) {
        return Object.keys(params).map(key => key+"="+params[key]).join('&');
    }

    function getMapFromObject(jsonObject) {
        const getMapFromObjectMap = new Map();
        for (key in jsonObject) {
            //console.log('getMapFromObject: objectKey='+key);
            let getMapFromObjectMapValue = jsonObject[key];
            let getMapFromObjectMapResMap = getByObject(key, getMapFromObjectMapValue);
            for (let x of Object.entries(getMapFromObjectMapResMap)) {
                getMapFromObjectMap[x[0]] = x[1];
            }
        }
        return mapSort(getMapFromObjectMap);
    }

    function getByObject(key, value) {
        //console.log('getByObject: check '+JSON.stringify(value));
        if(value) {
            if (getType(value) == 'Array') {
                return getByJsonArray(key, value);
            } else if (getType(value) == 'Object') {
                return getByJsonObject(key, value);
            } else {
                const getByObjectMap = new Map();
                getByObjectMap[key] = value;
                return getByObjectMap;
            }
        } else {
            return new Map();
        }
    }

    function getByJsonArray(key, value) {
        //console.log('getByJsonArray: '+key+'='+JSON.stringify(value));
        if(value) {
            const getByJsonArrayMap = new Map();
            for (i = 0; i < value.length; i++) {
                for (const x of Object.entries(getByObject(getArrayKey(key, i), value[i]))) {
                    getByJsonArrayMap[x[0]] = x[1];
                }
            }
            return mapSort(getByJsonArrayMap);
        } else {
            return new Map();
        }
    }

    function getByJsonObject(key, value) {
        //console.log('getByJsonObject: '+key+'='+JSON.stringify(value));
        if (value){
            const getByJsonObjectMap = new Map();
            for (innerKey in value) {
                for (const x of Object.entries(getByObject(getObjectKey(key, innerKey), value[innerKey]))) {
                    getByJsonObjectMap[x[0]] = x[1];
                }
            }
            return mapSort(getByJsonObjectMap);
        } else {
            return new Map();
        }
    }

    function getObjectKey(key, innerKey) {
        return key + "." + innerKey;
    }

    function getArrayKey(key, index) {
        return key+"["+index+"]";
    }

    function mapSort(map) {
        const mapSortKeys = Object.keys(map);
        const sortedMap = new Map();
        mapSortKeys.sort().forEach(k => sortedMap[k] = map[k]);
        return sortedMap;
    }

    function hmac(secretKey, message) {
        var crypto = require('crypto');
        var hmac = crypto.createHmac('sha256', secretKey);
        data = hmac.update(message);
        //Creating the hmac in the required format
        return data.digest('hex');
    }
}
