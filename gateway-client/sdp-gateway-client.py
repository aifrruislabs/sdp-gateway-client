#	Aifrruis Labs Software Defined Perimeter Gateway Application
#
#	This python code was written by
#	1. Elijah Masanga
#	2. Francis Ruambo
#
#	Date : 18th December 2021

import json2
import requests

#	Read Json Conf File to Get Token && Controller IP
conf_file = json2.load_file(r'sdp-conf.json')

controller_ip = conf_file['controller_ip']
gateway_token = conf_file['gateway_access_token']

controller_url = "http://" + controller_ip + "/api/v1"

headers = { "access_token" : gateway_token }
get_confs_data_req = requests.get(controller_url + "/get/confs/stanzas", headers=headers)

