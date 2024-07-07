

var ecoflowAPI = 'https://api-e.ecoflow.com';
var accessKey = '';
var secretKey = '';

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

function hmac(secretKey, message, algorithm = "SHA-256") {
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
    console.log(sortedParams);

    sortedParams.accessKey = accessKey;
    sortedParams.nonce = generateNonce();
    sortedParams.timestamp = generateTimestamp();

    queryParams = toQueryParamMapping(sortedParams);    
    console.log(queryParams);

    var fullPath = ecoflowAPI+path+'?'+queryParams;
    var header = {
        accessKey: sortedParams.accessKey,
        nonce: sortedParams.nonce,
        timestamp: sortedParams.timestamp,
        sign: hmac(secretKey, queryParams),
    };
    console.log(fullPath);
    console.log(header);
    
    var request = require('axios');
    request.get(ecoflowAPI+path, { headers:header, params: params })
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

EcoflowRequest("/iot-open/sign/device/quota/all", { sn: "HW51ZOH4SF769935" });
