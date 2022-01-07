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
const controller_ip = jsonData['controller_ip']
const controller_port = jsonData['controller_port']
const gateway_access_token = jsonData['gateway_access_token']

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

		//Send Kill Signal fwknopd
		cmd.runSync("fwknopd -K") 		

		//If Did not Started Start Now
		cmd.runSync("fwknopd") 		

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