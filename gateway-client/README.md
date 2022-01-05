# SDP Gateway Client

Maintaining Access for allowed clients by using fwknopd

"start": "concurrently \"nodemon app.js\" \"node collect_gateway_logs.js\"",

To Start Gateway Client

>> `npm run start` 

Configuration Parameters in  `sdp-conf.js` (Must be in json format)

{ 

	"controller_uri": "https://sdpapi.aifrruislabs.com", 

	"controller_ip": "178.62.76.239",

	"gatewayId": "such as 1", 

	"gateway_user_id": "such as 2", 

	"gateway_iface": "such as eth0", 

	"gateway_access_token": "gateway_access_token" 
}