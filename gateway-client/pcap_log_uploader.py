#	Aifrruis Labs Software Defined Perimeter Gateway Application
#
#	This python code was written by
#	1. Elijah Masanga
#	2. Francis Ruambo
#
#	Date : 9th July 2023

import os
import json
import requests
from time import sleep

json_data = []

# Pull configuration data
with open('sdp-conf.json', 'r') as f:
    json_data = json.load(f)

controller_uri = json_data['controller_uri']
gateway_iface = json_data['gateway_iface']
gateway_id = json_data['gateway_id']
gateway_user_id = json_data['gateway_user_id']
gateway_access_token = json_data['gateway_access_token']

serverUri = controller_uri + "/api/v1"

# Check If We Collect Logs So that before we start uploading pcap
# We make sure there will be pcaps to be uploaded
# Set headers
def start_processing_files(gateway_user_id, gateway_id, gateway_access_token):
    is_logging_headers = {
        'Content-Type': 'application/json',
        'userId': gateway_user_id,
        'gatewayId': gateway_id,
        'accessToken': gateway_access_token
    }

    is_logging_params = {
        'gatewayId': gateway_id
    }

    response = requests.get(
        url = serverUri + "/does/gateway/collect/logs",
        headers = is_logging_headers,
        params = is_logging_params
    )

    if response.status_code == 200:
        res_data = response.json()

        is_logging_status = res_data['does']
        time_period = res_data['period']

        print("Logging Status : " + str(is_logging_status) + " Period : " + str(time_period))

        if is_logging_status == 1:
            folder_path = "/home/gateway_pcap_log"
            upload_folder_contents(folder_path, time_period)

    else:
        print("Error: " + str(response.status_code))



# Upload Folder Contents
def upload_folder_contents(folder_path, time_period):
    api_url = serverUri + "/upload/log/collection/gateway"

    for pcap_file in os.listdir(folder_path):
        pcap_file_name = pcap_file
        pcap_file_path = os.path.join(folder_path, pcap_file)

        print("File Name : " + str(pcap_file_name) + "\n\n")
        print("File Path : " + str(pcap_file_path) + "\n\n")

        response = requests.post(
            api_url,
            
            params = {
                'gatewayId': gateway_id,
                'gatewayPcapTime': pcap_file_name,
            },

            files = {
                'file': open(pcap_file_path, 'rb')
            },

            headers = {
                'Content-Type': 'multipart/form-data',
                'userId': gateway_user_id,
                'gatewayId': gateway_id,
                'accessToken': gateway_access_token
          })
        
        print ("Pcap Upload Status : " + str(response.status_code))


# Start Processing PCAP Files
start_processing_files(gateway_user_id, gateway_id, gateway_access_token)