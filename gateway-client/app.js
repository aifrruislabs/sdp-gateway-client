const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

const multer  = require('multer')
const upload = multer()

const cmd = require("node-cmd")

const port = 8000

const fs = require('fs')

//JSON Middleware
app.use(express.json())

//Cors Middleware
app.use(cors())

//Morgan Middleware
app.use(morgan('combined'))

//Pull Configuration Data
const rawData = fs.readFileSync('sdp-conf.json')
const jsonData = JSON.parse(rawData);

const gateway_ip = jsonData['gateway_ip']
const gateway_iface = jsonData['gateway_iface']
const controller_ip = jsonData['controller_ip']
const controller_port = jsonData['controller_port']
const gateway_access_token = jsonData['gateway_access_token']


//Turn on Gateway Default Policy
app.post('/api/v1/down/default/drop/firewall/policy', upload.none(), async (req, res) => {

	var { gatewayAccessToken, serviceProto, servicePort } = req.body

	if (gateway_access_token == gatewayAccessToken) {

		cmd.runSync("iptables -I INPUT 1 -i "+gateway_iface+" -p "+serviceProto+" --dport "+servicePort+" -j ACCEPT")
		cmd.runSync("iptables -I INPUT 1 -i "+gateway_iface+" -p "+serviceProto+" --dport "+servicePort+" -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT")
		
	}

	res.status(200).json({
		'status': true
	})

})


//Turn on Gateway Default Policy
app.post('/api/v1/up/default/drop/firewall/policy', upload.none(), async (req, res) => {

	var { gatewayAccessToken, serviceProto, servicePort } = req.body

	if (gateway_access_token == gatewayAccessToken) {

		cmd.runSync("iptables -I INPUT 1 -i "+gateway_iface+" -p "+serviceProto+" --dport "+servicePort+" -j DROP")
		cmd.runSync("iptables -I INPUT 1 -i "+gateway_iface+" -p "+serviceProto+" --dport "+servicePort+" -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT")

	}

	res.status(200).json({
		'status': true
	})

})

//Create Update Gateway Stanza
app.post('/api/v1/create/update/gateway/stanza',  upload.none(), async (req, res) => {

	var { clientId, clientConfName, clientConfData, gatewayAccessToken } = req.body

	if (gateway_access_token == gatewayAccessToken) {

		var stanzaConfFile = "/etc/fwknop/sdp_conf.d/" + clientConfName
	
		//Delete Config File
		cmd.runSync("rm -rf " + stanzaConfFile)
	
		//Create Stanza Config file
		cmd.runSync("touch " + stanzaConfFile) 	

		//Put Stanza Config Data
		cmd.runSync("echo \"" + clientConfData + "\" >> " + stanzaConfFile)

		//Set right permissions for the file
		cmd.runSync("chmod -R 0600 " + stanzaConfFile) 

		//Send Restart Signal fwknopd
		cmd.runSync("fwknopd --restart") 		

		//If Did not Started Start Now
		cmd.runSync("fwknopd -i " + gateway_iface) 		

		res.status(201).json({
			'status': true
		})

	}else {
		res.status(401).json({
			'status': false,
			'message': 'Gateway Access Token Un-Authorized'
		})
	}
 	
})

app.listen(port, () => {
  console.log(`Gateway app listening at http://${gateway_ip}:${port}`)
})
