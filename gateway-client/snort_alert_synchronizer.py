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

# log_file = "alert.txt"
# log_track = "alert_tracker.json"

log_file = "/var/log/snort/alert"
log_track = "/var/log/snort/alert_tracker.json"

json_sdp_conf_data = []
json_tracker_data = []
last_track_line_number = 0

# Pull configuration data
sdp_conf_json = open("sdp-conf.json", "r")
json_sdp_conf_data = json.load(sdp_conf_json)

controller_uri = json_sdp_conf_data["controller_uri"]
gateway_iface = json_sdp_conf_data["gateway_iface"]
gateway_id = json_sdp_conf_data["gateway_id"]
gateway_user_id = json_sdp_conf_data["gateway_user_id"]
gateway_access_token = json_sdp_conf_data["gateway_access_token"]

serverUri = controller_uri + "/api/v1"

# Update File Tracker
def update_file_tracker(new_line_track):
    file_data_tracker = open(log_track, "r")
    data = json.load(file_data_tracker)

    data["line_number"] = new_line_track

    with open(log_track, "w") as f:
        json.dump(data, f)


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
    # Pull Alert Tracker data
    log_track_json = open(log_track, "r")
    json_tracker_data = json.load(log_track_json)

    last_track_line_number = json_tracker_data["line_number"]

    # Open SDP Alert Placeholder file
    stream_log_file = open(log_file, "r")
    log_lines = stream_log_file.readlines()
    total_len_lines = len(log_lines)

    line_count = 1
    alert_cache_start = 0 
    alert_cache_end = 0

    if total_len_lines > line_count:
        print ("New Lines Have Been Added to alert File")

        for line in log_lines:
            
            if line_count >= last_track_line_number:
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

        # Mark Last Line in Tracker
        update_file_tracker(line_count)

        # Wait for 30 seconds before sending 
        # Another batch
        print ("Waiting for Next Batch of Alerts")
        sleep(30)
    else:
        print ("No New Lines Have Been Added to Snort Alert File")
        sleep(30)