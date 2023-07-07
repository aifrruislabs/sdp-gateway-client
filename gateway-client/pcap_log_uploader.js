//	Aifrruis Labs Software Defined Perimeter Gateway Application
//
//	This python code was written by
//	1. Elijah Masanga
//	2. Francis Ruambo
//
//	Date : 7th July 2023

const fs = require('fs')
const axios = require('axios')

//Pull Configuration Data
const rawData = fs.readFileSync('sdp-conf.json')
const jsonData = JSON.parse(rawData)

const controller_uri = jsonData['controller_uri']

const gateway_iface = jsonData['gateway_iface']
const gateway_id = jsonData['gateway_id']
const gateway_user_id = jsonData['gateway_user_id']
const gateway_access_token = jsonData['gateway_access_token']

const serverUri = controller_uri + "/api/v1"


// Function to read files from a folder
function readFolder(folderPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(files);
    });
  });
}

// Function to upload a file to the API
function uploadFile(file) {
  const apiUrl = serverUri + "/upload/log/collection/gateway";
  
  //Form Data
  const formData = new FormData();
  formData.append('gatewayId', gateway_id);
  formData.append('gatewayPcapTime', file);
  formData.append('gatewayPcapLog', fs.createReadStream(file));

  return axios.post(apiUrl, formData, {
    //Headers
    headers: {
      'Content-Type': 'multipart/form-data',
      'userId': gateway_user_id,
      'gatewayId': gateway_id,
      'accessToken': gateway_access_token
    }
  });
}

// Main function to read folder contents and upload files
async function uploadFolderContents(folderPath, timePeriod) {
    while (true) {
        
        console.log("\n\nUploading Pcap Batch...\n\n");

        try {
            var files = await readFolder(folderPath);
            
            for (const file of files) {
                const resData = await uploadFile(`${folderPath}/${file}`).data;

                if (resData['status'] == true) {
                    console.log("File " + file + " was Uploaded successfully");
                }else {
                    console.log("Failed to Upload pcap file");
                }
            }

            console.log('Folder contents uploaded successfully.');
        } catch (error) {
            console.error('Error uploading folder contents:', error);
        }

        //Wait for 5 seconds before reading again
        await sleep(parseInt(timePeriod) * 1000);
    }

}


 //Check If We Collect Logs So that before we start uploading pcap
 //We make sure there will be pcaps to be uploaded
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
    const timePeriod = resData['period'];

    if (isLoggingStatus == 1) {

        // Start Uploading Data
        const folderPath = '/home/gateway_pcap_log';
        uploadFolderContents(folderPath, timePeriod);

    }

});