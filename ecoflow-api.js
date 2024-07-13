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

        async function EcoflowRequest(path, params, errFunc) {
            if (params) {
                keys = Object.keys(params);
                sortedParams = new Map();
                keys.sort().forEach(k => sortedParams[k] = params[k]);
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
            
            return await request.get(path, { headers:header, params: params })
                .then(function (response) {
                    node.debug(response.status);

                    node.debug(response.data);
                    if (response.status == 200 && response.data.data) {
                        return response.data.data;
                    } else {
                        errFunc(response.data)
                    }
                })
                .catch(function(error) {
                    node.error(error);
                    errFunc(error);
                });
        }

        node.queryQuotaAll = function(sn, errFunc = function(_) {}) {
            return EcoflowRequest("/iot-open/sign/device/quota/all", { sn: sn }, errFunc);
        }
        node.queryDeviceList = function(errFunc = function(_) {}) {
            return EcoflowRequest("/iot-open/sign/device/list", {}, errFunc);
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
        return Object.keys(params).map(key => {
            v=params[key];
            switch(getType(v)) {
                case 'Array':
                    return Object.keys(v)
                        .map(k => {
                            var start = key+"["+k+"]";
                            if (getType(v[k]) =='Object') {
                                return Object.keys(v[k]).map(k2 => start+"."+k2+"="+v[k][k2]).join('&');
                            } else {
                                return start+"="+v[k];
                            }
                        }).join('&');
                    case 'Object':
                        return Object.keys(v).map(k => key+"."+k+"="+v[k]).join('&');
                default:
                    return key+"="+v;
            }}).join('&');
    }

    function hmac(secretKey, message) {
        var crypto = require('crypto');
        var hmac = crypto.createHmac('sha256', secretKey);
        data = hmac.update(message);
        //Creating the hmac in the required format
        return data.digest('hex');
    }
}
