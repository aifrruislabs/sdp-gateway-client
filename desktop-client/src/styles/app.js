// var apiServerUrl = "http://127.0.0.1:8000"

// var apiServerUrl = "http://172.17.0.2:8000"

// var apiServerUrl = "http://137.184.29.107:12800"

var apiServerUrl = "https://sdpapi.aifrruislabs.com"

var clientId = ""

var clientToken = ""

var clientPublicIp = ""

var clientInternalIp = ""

var gatewayNetworkAccessibility = ""

//Setup Client Gateway
function setupClientGateway() {

}

//Get Next Page
function getGoNextPage(scoreFactorIdsList) {

	var next_page = ""

	var fileName = location.href.split("/").slice(-1); 

	//Detemine Next Page for Verification / Validation
	if (scoreFactorIdsList != 0) {

		if (scoreFactorIdsList[0] == 2) {
			next_page = "mac_address_verification.html";	

		}else if (scoreFactorIdsList[0] == 3) {
			next_page = "geo_location_verification.html";

		}else if (scoreFactorIdsList[0] == 4) {
			next_page = "tpm_security_check.html";

		}else if (scoreFactorIdsList[0] == 5) {
			next_page = "face_recognition_verification.html";

		}

	}else {
		next_page = "client_dashboard.html"
	}

	if (fileName == next_page) {
		next_page = "client_dashboard.html"
	}

	return next_page;
}


//Continue Button
function continueBtnNext() {

	axios.get(apiServerUrl + "/api/v1/get/next/page/client/continue", { 
            headers : {
                'Content-Type': 'application/json',
                clientId: localStorage.getItem('clientId'),
                clientToken: localStorage.getItem('clientToken')
            }

        }).then(function (response) {

        	const resData = response.data

        	const jsonData = JSON.parse(JSON.stringify(resData))

        	if (jsonData['status'] == true) {

        		var scoreFactorIdsList = jsonData['scoreFactorIdsList']

        		//Next Page
        		var next_page = getGoNextPage(scoreFactorIdsList)

        		window.location.assign(next_page)

    		}

    	})

}

//Get Client Public Ip
function getClientPublicIp() {
	$.get('https://api.ipify.org?format=json', function (data) {

		var jsonData = JSON.parse(JSON.stringify(data));

		clientPublicIp = jsonData['ip'];

		//Update Client Public IP
		axios.post(apiServerUrl + "/api/v1/update/client/public/ip", {
				'clientPublicIp': clientPublicIp
			},

			{ 
			headers : {
				'Content-Type': 'application/json',
				clientId: localStorage.getItem('clientId'),
				clientToken: localStorage.getItem('clientToken')
			}

		})

	});
}

$(document).ready(function () {

	//Hide Gateway List
	// $("#gatewayPanel").hide();

	//Get Client Public IP
	getClientPublicIp();

});