#	Aifrruis Labs Software Defined Perimeter Gateway Application
#
#	This python code was written by
#	1. Elijah Masanga
#	2. Francis Ruambo
#
#	Date : 5th August 2023

import os
import sys
import json
import requests
from time import sleep

#log_dir = "/var/log/snort/alert"
#log_file = "tosuffer_alerts.txt"
#log_sdp_file = "alert.sdp.txt"

log_file = "/var/log/snort/alert"
log_sdp_file = "/var/log/snort/alert_sdp"

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

# Upload Snort Alert Chunk to SDP Controller
def  upload_chunk_to_sdp_controller(log_chunk):
    data = { "log_chunk": log_chunk }

    headers = {
            "Content-Type": "application/json",
            "userId": gateway_user_id,
            "gatewayId": gateway_id,
            "accessToken": gateway_access_token 
    }
    
    post_url = serverUri + "/upload/gateway/snort/alert"
    chunk_upload_req = requests.post(post_url, json=data, headers=headers)

    print("Chunk Upload Status : " + str(chunk_upload_req.status_code))


while True:
    # Clear SDP Alert Placeholder
    os.system("rm -rf " + str(log_sdp_file))

    # Copy Current Alert Data
    os.system("cp " + str(log_file) + " " + str(log_sdp_file))

    # Delete Snort Alerts
    os.system("rm -rf " + str(log_file))

    # Create New With No Info Snort Alert File
    os.system("touch " + str(log_file))

    # Open SDP Alert Placeholder file
    stream_log_file = open(log_sdp_file, "r")
    log_lines = stream_log_file.readlines()

    line_count = 1
    alert_cache_start = 0 
    alert_cache_end = 0

    for line in log_lines:
        
        if line.startswith("[**]"):
            alert_cache_start = (line_count - 1)
            
        if len(line) == 1:
            alert_cache_end = line_count

            # Process This Chunk
            log_chunk = log_lines[int(alert_cache_start):int(alert_cache_end)]

            # Upload Chunk to SDP Controller
            upload_chunk_to_sdp_controller(log_chunk)

            print(log_chunk)
            print ("\n\n")
            
        line_count += 1

    # Wait for 30 seconds before sending 
    # Another batch
    print ("Waiting for Next Batch of Alerts")
    sleep(30)