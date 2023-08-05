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

log_dir = "/var/log/snort/alert"
log_sdp_file = "/var/log/snort/alert_sdp"

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

            print(log_chunk)
            print ("\n\n")
            
        line_count += 1

    # Wait for 30 seconds before sending 
    # Another batch
    print ("Waiting for Next Batch of Alerts")
    sleep(30)

# Upload Snort Alert Chunk to SDP Controller
def  upload_chunk_to_sdp_controller(log_chunk):
    return true