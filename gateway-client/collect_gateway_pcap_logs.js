//	Aifrruis Labs Software Defined Perimeter Gateway Application
//
//	This python code was written by
//	1. Elijah Masanga
//	2. Francis Ruambo
//
//	Date : 7th July 2023

const fs = require('fs')
const axios = require('axios')
const cmd = require('node-cmd')

//Pull Configuration Data
const rawData = fs.readFileSync('sdp-conf.json')
const jsonData = JSON.parse(rawData)

const controller_uri = jsonData['controller_uri']

const gateway_iface = jsonData['gateway_iface']
const gateway_id = jsonData['gateway_id']
const gateway_user_id = jsonData['gateway_user_id']
const gateway_access_token = jsonData['gateway_access_token']

const serverUri = controller_uri + "/api/v1"

const pcapFolder = '/home/gateway_pcap_log'

// Sleep Function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Start Data Log Process
async function startDataLogProcess(pcapFolder, loggingPeriod) {
            
    while (1) {

        var filename = new Date().toISOString();

        var pcapFileName = pcapFolder + '/' + filename + '.pcap';

        console.log("Starting Collection : " + pcapFileName)

        var loggingPeriodInt = parseInt(loggingPeriod);

        //tcpdump -i eth0 -w "/home/alpha/alpha.pcap" -G 5 -W 1

        cmd.runSync("tcpdump -i " + gateway_iface + " -w " + pcapFileName + " -G " + loggingPeriodInt + " -W 1")

        await sleep((loggingPeriodInt * 1000) - 100);
    }
}


fs.access(pcapFolder, fs.constants.F_OK, (err) => {
    if (err) {
        //Creating New Folder for Storing Pcap Logs
        fs.mkdir(pcapFolder, { recursive: true }, (err) => {
            if (err) {
            console.error(err);
            } else {
            console.log('Folder created successfully');
            }
        });
    }

    //Check If We Collect Logs and Which Period We are Using
    // Set headers
    var isLoggingHeaders = {
        'Content-Type': 'application/json',
        'userId': gateway_user_id,
        'gatewayId': gateway_id,
        'accessToken': gateway_access_token
    }

    // Set query parameters
    var isLoggingParams = {
        'gatewayId': gateway_id
    }

    axios.get(serverUri + "/does/gateway/collect/logs", { 
            headers: isLoggingHeaders, 
            params: isLoggingParams 
    })
    .then(response => {
        // Handle successful response
        var resData = response.data;

        const isLoggingStatus = resData['does'];
        const loggingPeriod = resData['period'];

        if (isLoggingStatus == 1) {

            startDataLogProcess(pcapFolder, loggingPeriod)

        }else {
            console.log("Controller Set Gateway not to Log")
        }
    })
    .catch(error => {
        // Handle error
        console.error(error);
    });

});