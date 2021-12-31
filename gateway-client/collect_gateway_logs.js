const axios = require('axios')
var netStat = require('net-stat')
var cpuStat = require('cpu-stat')

//Pull Configuration Data
const rawData = fs.readFileSync('sdp-conf.json')
const jsonData = JSON.parse(rawData);

const controller_ip = jsonData['controller_ip']
const controller_port = jsonData['controller_port']

const gateway_id = jsonData['gateway_id']
const gateway_user_id = jsonData['gateway_user_id']
const gateway_access_token = jsonData['gateway_access_token']

const serverUri = "http://" + controller_ip + ":" + controller_port + "/api/v1"

var netRx = ""
var netTx = ""
var cpuPercent = ""

//Get Transmit Stats
setInterval(function() {
  
    netStat.usageTx({
      iface: 'eth0',
      units: 'MiB',
      sampleMs: 1000,
    }, function(mbps) {
        netRx = mbps
    }, 1000)

})


//Get Receive Stats
setInterval(function() {
  
  netStat.usageRx({
    iface: 'eth0',
    units: 'MiB',
    sampleMs: 1000,
  }, function(mbps) {
    netTx = mbps
  });

}, 1000)


//Get CPU Percent Stats
setInterval(function () {

  cpuStat.usagePercent(function(err, percent, seconds) {
      cpuPercent = percent
  });

}, 1000)


//Send Stats to Controller
setInterval(function () {

    console.log("Traffic RX : " + netRx + " Traffic TX : " + netTx + " CPU Percent : " + cpuPercent)

    // axios.post(serverUri + "/post/gateway/network/traffic/tx", {

    //          'trafficRx': netRx,
    //          'trafficTx': netTx,
    //          'cpuPercent': cpuPercent

    //          }, { 
    //              headers : {
    //                  'Content-Type': 'application/json',
    //                  'userId': gateway_user_id,
    //                  'gatewayId': gateway_id,
    //                  'accessToken': gateway_access_token
    //             }

    //         })
}, 2000)
