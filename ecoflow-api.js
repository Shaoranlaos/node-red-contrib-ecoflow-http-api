const axios = require('axios');
const http  = require('http')


module.exports = function(RED) {

    var accessKey;
    var secretKey;
    var request;
    var ecoflowApiServer

    function RemoteServerNode(n) {
        RED.nodes.createNode(this,n);

        ecoflowApiServer = n.server;
        accessKey = this.credentials.access_key;
        secretKey = this.credentials.secret_key;

        request = axios.create({
            baseURL: ecoflowApiServer,
            timeout: 5000,
            httpAgent: new http.Agent({ keepAlive: true }),
        });

        this.queryQuotaAll = function(sn, resFunc) {
            EcoflowRequest("/iot-open/sign/device/quota/all", { sn: sn }, resFunc);
        }
    
        this.queryDeviceList = function(resFunc) {
            EcoflowRequest("/iot-open/sign/device/list", {}, resFunc);
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

    function hmac(message) {
        var crypto = require('crypto');
        var hmac = crypto.createHmac('sha256', secretKey);
        data = hmac.update(message);
        //Creating the hmac in the required format
        return data.digest('hex');
    }


    function EcoflowRequest(path, params, resFunc) {
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
            sign: hmac(queryParams),
        };
        console.log(ecoflowApiServer+path+'?'+queryParams);
        console.log(header);
        
        request.get(path, { headers:header, params: params })
            .then(function (response) {
                console.log(response.status);
                console.log(response.data);
                if (response.status == 200) {
                    resFunc(response.data.data);
                }
            })
            .catch(function(error) {
                console.log(error);
            });
    }
}
