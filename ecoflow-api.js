module.exports = function() {
    const axios = require('axios');

    const ecoflowAPI = 'https://api-e.ecoflow.com';
    const request = axios.create({
        baseURL: ecoflowAPI,
        timeout: 5000,
        httpAgent: new http.Agent({ keepAlive: true }),
      });

    var accessKey;
    var secretKey;

function init(ak, sk) {
    accessKey = ak;
    secretKey = sk;
}

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


function EcoflowRequest(path, params) {
    var keys = Object.keys(params);
    sortedParams = new Map();
    keys.sort().forEach(k => sortedParams[k] = params[k]);

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
    //console.log(ecoflowAPI+path+'?'+queryParams);
    //console.log(header);
    
    request.get(path, { headers:header, params: params })
        .then(function (response) {
            console.log(response.status);
            if (response.status == 200) {
                console.log(response.data);
            }
        })
        .catch(function(error) {
            console.log(error);
        });
}

function queryQuotaAll(sn) {
    return EcoflowRequest("/iot-open/sign/device/quota/all", { sn: sn });
}

}