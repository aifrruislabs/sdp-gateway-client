const fs = require('fs')
const axios = require('axios')
const cmd = require('node-cmd')

//Pull Configuration Data
const rawData = fs.readFileSync('sdp-conf.json')
const jsonData = JSON.parse(rawData);

const controller_uri = jsonData['controller_uri']

const gateway_iface = jsonData['gateway_iface']
const gateway_id = jsonData['gateway_id']
const gateway_user_id = jsonData['gateway_user_id']
const gateway_access_token = jsonData['gateway_access_token']

const serverUri = controller_uri + "/api/v1"

const pcapFolder = '/home/gateway_pcap_log';

// Start Data Log Process
async function startDataLogProcess(pcapFolder, loggingPeriod) {
    const filename = new Date().toISOString();
            
    while (1) {

        const pcapFileName = pcapFolder + '/' + filename + '.pcap';

        console.log("Starting Collection : " + pcapFileName)

        cmd.runSync("tcpdump -i " + gateway_iface + " -w " + pcapFileName + " -G " + loggingPeriod + " -W 1")

        await sleep(2000);
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
  } else {
    //Check If We Collect Logs and Which Period We are Using
    // Set headers
    const isLoggingheaders = {
        'Content-Type': 'application/json',
        'userId': gateway_user_id,
        'gatewayId': gateway_id,
        'accessToken': gateway_access_token
    };
    
    // Set query parameters
    const isLoggingparams = {
        'gatewayId': gateway_id
    };
    
    axios.get(serverUri + "/does/gateway/collect/logs", { isLoggingheaders, isLoggingparams })
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

  }
});