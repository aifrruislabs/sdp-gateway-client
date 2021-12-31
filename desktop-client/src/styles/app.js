var apiServerUrl = "http://127.0.0.1:8000"
// var apiServerUrl = "http://sdpapi.aifrruislabs.com"

var clientId = ""

var clientToken = ""

var clientPublicIp = ""

//Setup Client Gateway
function setupClientGateway() {

}

//Get Client Public Ip
function getClientPublicIp() {
	$.get('https://api.ipify.org?format=json', function (data) {

		var jsonData = JSON.parse(JSON.stringify(data));

		clientPublicIp = jsonData['ip'];

	});
}

$(document).ready(function () {

	//Hide Gateway List
	// $("#gatewayPanel").hide();

	//Get Client Public IP
	getClientPublicIp();

});